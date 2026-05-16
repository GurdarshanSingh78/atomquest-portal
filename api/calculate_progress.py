import json
from http.server import BaseHTTPRequestHandler
from datetime import datetime
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            goal_id = data.get('goal_id')
            quarter = data.get('quarter')
            actual = data.get('actual_achievement')
            status = data.get('status')
            
            if not goal_id or not quarter or actual is None or not status:
                return self.send_json_response(400, {"error": "Missing parameters for calculation parameters."})
                
            supabase = get_db()
            
            goal_res = supabase.table('goals').select('*').eq('id', goal_id).single().execute()
            if not goal_res.data:
                return self.send_json_response(404, {"error": "Target goal configuration not found."})
                
            goal = goal_res.data
            uom = goal.get('uom_type')
            target = goal.get('target')
            
            # Progress calculation formulas per BRD rules
            score = 0.0
            try:
                if uom in ['Min_Numeric', 'Min_Percent']:
                    score = (float(actual) / float(target)) * 100
                elif uom in ['Max_Numeric', 'Max_Percent']:
                    score = (float(target) / float(actual)) * 100 if float(actual) != 0 else 0
                elif uom == 'Zero':
                    score = 100.0 if float(actual) == 0 else 0.0
                elif uom == 'Timeline':
                    actual_date = datetime.strptime(actual, "%Y-%m-%d")
                    target_date = datetime.strptime(target, "%Y-%m-%d")
                    score = 100.0 if actual_date <= target_date else 0.0
            except ValueError:
                return self.send_json_response(400, {"error": "Data formatting mismatch for UoM calculation."})

            rounded_score = round(score, 2)

            # --- SYSTEM CASCADE: ACHIEVEMENT SYNC LOOP ---
            # Identify all targets linking to this objective as children
            linked_goals_res = supabase.table('goals').select('id').eq('parent_goal_id', goal_id).execute()
            all_target_ids = [goal_id] + [g['id'] for g in linked_goals_res.data]
            
            primary_checkin_record = None
            
            for target_id in all_target_ids:
                existing = supabase.table('check_ins').select('*').eq('goal_id', target_id).eq('quarter', quarter).execute()
                
                record_data = {
                    "goal_id": target_id,
                    "quarter": quarter,
                    "actual_achievement": str(actual),
                    "progress_score": rounded_score,
                    "status": status,
                    "updated_at": "now()"
                }
                
                if existing.data:
                    res = supabase.table('check_ins').update(record_data).eq('id', existing.data[0]['id']).execute()
                else:
                    res = supabase.table('check_ins').insert(record_data).execute()
                
                if target_id == goal_id:
                    primary_checkin_record = res.data[0]

            return self.send_json_response(200, {
                "success": True,
                "score": rounded_score,
                "data": primary_checkin_record,
                "cascaded_count": len(all_target_ids) - 1
            })
            
        except Exception as e:
            return self.send_json_response(500, {"error": f"Internal execution failure: {str(e)}"})

    def send_json_response(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') 
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))