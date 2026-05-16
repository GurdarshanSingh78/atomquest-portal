import json
from http.server import BaseHTTPRequestHandler
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            supabase = get_db()
            
            # Fetch all rows across tables to compute live organizational summaries
            goals_res = supabase.table('goals').select('thrust_area, is_locked').execute()
            check_ins_res = supabase.table('check_ins').select('status, progress_score').execute()
            escalations_res = supabase.table('escalation_logs').select('*').execute()
            
            goals = goals_res.data
            checkins = check_ins_res.data
            
            # Group distributions across Thrust Areas
            distribution = {"Financial": 0, "Customer": 0, "Process": 0, "Learning": 0}
            for g in goals:
                area = g.get('thrust_area')
                if area in distribution:
                    distribution[area] += 1
                    
            # Group metric variations across Check-in Progress Statuses
            statuses = {"Not Started": 0, "On Track": 0, "Completed": 0}
            for c in checkins:
                st = g.get('status', 'Not Started')
                if st in statuses:
                    statuses[st] += 1
                    
            return self.send_json_response(200, {
                "success": True,
                "metrics": {
                    "distribution": distribution,
                    "status_breakdown": statuses,
                    "active_escalations_count": len(escalations_res.data)
                }
            })
            
        except Exception as e:
            return self.send_json_response(500, {"error": str(e)})

    def send_json_response(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))