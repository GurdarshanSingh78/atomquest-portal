import json
from http.server import BaseHTTPRequestHandler
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            goal_id = data.get('goal_id')
            manager_id = data.get('manager_id')
            action = data.get('action')
            
            edited_target = data.get('edited_target')
            edited_weightage = data.get('edited_weightage')
            
            if not goal_id or not manager_id or not action:
                return self.send_json_response(400, {"error": "Missing critical parameters."})
            
            supabase = get_db()
            
            if action == 'approve':
                update_fields = {"is_locked": True}
                log_desc = "Manager Authorized and Locked Goal Parameters"
                
                if edited_target is not None:
                    update_fields["target"] = str(edited_target)
                if edited_weightage is not None:
                    update_fields["weightage"] = float(edited_weightage)
                    log_desc += f" (Adjusted Weightage to {edited_weightage}%)"
                
                update_res = supabase.table('goals').update(update_fields).eq('id', goal_id).execute()
                
                if not update_res.data:
                    return self.send_json_response(404, {"error": "Target objective not found."})
                    
                audit_record = {
                    "goal_id": goal_id,
                    "changed_by": manager_id,
                    "change_description": log_desc
                }
                supabase.table('audit_logs').insert(audit_record).execute()
                message = "Objective authorized and locked with adjustments."
                
            elif action == 'return':
                audit_record = {
                    "goal_id": goal_id,
                    "changed_by": manager_id,
                    "change_description": "Manager Rejected and Returned Goal for Rework"
                }
                supabase.table('audit_logs').insert(audit_record).execute()
                message = "Objective returned to operative."
            else:
                return self.send_json_response(400, {"error": "Unrecognized command."})

            return self.send_json_response(200, {"success": True, "message": message})
            
        except Exception as e:
            return self.send_json_response(500, {"error": f"System Exception: {str(e)}"})

    def send_json_response(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') 
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()