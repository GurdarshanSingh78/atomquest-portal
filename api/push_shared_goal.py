import json
from http.server import BaseHTTPRequestHandler
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            manager_id = data.get('manager_id')
            title = data.get('title')
            description = data.get('description', '')
            thrust_area = data.get('thrust_area')
            uom_type = data.get('uom_type')
            target = data.get('target')
            employee_ids = data.get('employee_ids', []) # Array of user UUIDs
            
            if not manager_id or not title or not thrust_area or not uom_type or not target or not employee_ids:
                return self.send_json_response(400, {"error": "Missing mandatory shared goal metrics."})
                
            supabase = get_db()
            
            # 1. Insert the primary root goal owned by the manager
            root_goal = {
                "user_id": manager_id,
                "title": title,
                "description": description,
                "thrust_area": thrust_area,
                "uom_type": uom_type,
                "target": str(target),
                "weightage": 10, # Base default placeholder
                "is_locked": False,
                "is_shared": True
            }
            root_res = supabase.table('goals').insert(root_goal).execute()
            parent_id = root_res.data[0]['id']
            
            # 2. Replicate linked child rows across all target operatives
            child_records = []
            for emp_id in employee_ids:
                child_records.append({
                    "user_id": emp_id,
                    "parent_goal_id": parent_id,
                    "title": title,
                    "description": description,
                    "thrust_area": thrust_area,
                    "uom_type": uom_type,
                    "target": str(target),
                    "weightage": 10, # Base default, editable by recipient later
                    "is_locked": False, # Open for weightage modification phase
                    "is_shared": True
                })
                
            supabase.table('goals').insert(child_records).execute()
            
            return self.send_json_response(200, {
                "success": True, 
                "message": f"Departmental KPI successfully pushed and linked across {len(employee_ids)} sheets."
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