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
            admin_id = data.get('admin_id') or "HR_ADMIN_OVERRIDE"
            
            if not goal_id:
                return self.send_json_response(400, {"error": "Missing target goal parameter."})
                
            supabase = get_db()
            
            # 1. Clear secure block by resetting lock flag back to false
            update_res = supabase.table('goals').update({"is_locked": False}).eq('id', goal_id).execute()
            
            if not update_res.data:
                return self.send_json_response(404, {"error": "Target objective not found."})
                
            # 2. Append administrative override signature to the audit logging chain
            audit_record = {
                "goal_id": goal_id,
                "changed_by": admin_id,
                "change_description": "Admin Overrode Security System and Disengaged Goal Lock for Revision"
            }
            supabase.table('audit_logs').insert(audit_record).execute()
            
            return self.send_json_response(200, {
                "success": True,
                "message": "Security lock disengaged. Open revision clearance granted."
            })
            
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