import json
from http.server import BaseHTTPRequestHandler
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            supabase = get_db()
            
            # Look up unapproved goal structures to find any overdue items
            unapproved_res = supabase.table('goals').select('*, users(*)').eq('is_locked', False).execute()
            goals = unapproved_res.data
            
            logs_created = 0
            for goal in goals:
                emp = goal.get('users', {})
                emp_name = emp.get('full_name', 'Unknown')
                emp_id = goal.get('user_id')
                
                # Check for existing logs to compute the escalation interval steps
                existing_logs = supabase.table('escalation_logs').select('*').eq('user_id', emp_id).execute()
                level = len(existing_logs.data) + 1
                
                if level <= 3:
                    msg = ""
                    if level == 1:
                        msg = f"Escalation Level 1: Operative {emp_name} has unsubmitted performance frameworks."
                    elif level == 2:
                        msg = f"Escalation Level 2: Manager reporting lines alerted for review stagnation on {emp_name} sheet."
                    elif level == 3:
                        msg = f"CRITICAL Escalation Level 3: Final HR/Skip-level governance directive sent for {emp_name}."
                        
                    supabase.table('escalation_logs').insert({
                        "user_id": emp_id,
                        "escalation_level": level,
                        "alert_message": msg
                    }).execute()
                    logs_created += 1
                    
            return self.send_json_response(200, {
                "success": True,
                "message": "Escalation timeline logic check complete.",
                "cycles_escalated": logs_created
            })
            
        except Exception as e:
            return self.send_json_response(500, {"error": str(e)})

    def send_json_response(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))