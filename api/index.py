import json
import csv
import io
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse
from datetime import datetime
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url_path = urlparse(self.path).path
        supabase = get_db()
        
        try:
            # 1. GET: Fetch Pending Goals for Manager Review
            if url_path == "/api/get_pending_goals":
                response = supabase.table('goals').select('*').eq('is_locked', False).execute()
                return self.send_json_response(200, {"success": True, "data": response.data})

            # 2. GET: Fetch Locked Goals for Telemetry Tracking
            elif url_path == "/api/get_locked_goals":
                response = supabase.table('goals').select('*, check_ins(*)').execute()
                return self.send_json_response(200, {"success": True, "data": response.data})

            # 3. GET: Fetch Tracked Goals for Active Manager Metrics
            elif url_path == "/api/get_tracked_goals":
                response = supabase.table('goals').select('*, check_ins(*)').eq('is_locked', True).execute()
                return self.send_json_response(200, {"success": True, "data": response.data})

            # 4. GET: Fetch Admin Dashboard Logs and Totals
            elif url_path == "/api/get_admin_data":
                logs_res = supabase.table('audit_logs').select('*').order('changed_at', desc=True).limit(20).execute()
                goals_res = supabase.table('goals').select('*').execute()
                goals = goals_res.data
                total_goals = len(goals)
                locked_goals = sum(1 for g in goals if g.get('is_locked') == True)
                alignment_percentage = int((locked_goals / total_goals * 100)) if total_goals > 0 else 0
                
                return self.send_json_response(200, {
                    "success": True, 
                    "data": {
                        "audit_logs": logs_res.data,
                        "goals": goals,
                        "stats": {"total_locked": locked_goals, "alignment_score": alignment_percentage}
                    }
                })

            # 5. GET: Aggregate Operational Analytics Summaries
            elif url_path == "/api/get_analytics_data":
                goals_res = supabase.table('goals').select('thrust_area').execute()
                check_ins_res = supabase.table('check_ins').select('status').execute()
                escalations_res = supabase.table('escalation_logs').select('*').execute()
                
                distribution = {"Financial": 0, "Customer": 0, "Process": 0, "Learning": 0}
                for g in goals_res.data:
                    area = g.get('thrust_area')
                    if area in distribution: distribution[area] += 1
                        
                statuses = {"Not Started": 0, "On Track": 0, "Completed": 0}
                for c in check_ins_res.data:
                    st = c.get('status', 'Not Started')
                    if st in statuses: statuses[st] += 1
                        
                return self.send_json_response(200, {
                    "success": True,
                    "metrics": {"distribution": distribution, "status_breakdown": statuses, "active_escalations_count": len(escalations_res.data)}
                })

            # 6. GET: Governance Report Data Exporter (CSV Stream)
            elif url_path == "/api/export_csv":
                response = supabase.table('goals').select('title, thrust_area, uom_type, target, weightage, user_id, check_ins(quarter, actual_achievement, progress_score, status)').execute()
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow(['Employee ID', 'Thrust Area', 'Goal Title', 'UoM Type', 'Weightage %', 'Planned Target', 'Reporting Quarter', 'Actual Achievement', 'Computed Progress Score', 'Status'])
                
                for goal in response.data:
                    emp_id = goal.get('user_id', 'SYSTEM_OP')
                    area = goal.get('thrust_area', '')
                    title = goal.get('title', '')
                    uom = goal.get('uom_type', '')
                    weight = goal.get('weightage', '')
                    target = goal.get('target', '')
                    checkins = goal.get('check_ins', [])
                    
                    if not checkins:
                        writer.writerow([emp_id, area, title, uom, weight, target, 'N/A', 'N/A', '0%', 'Not Started'])
                    else:
                        for ci in checkins:
                            writer.writerow([emp_id, area, title, uom, weight, target, ci.get('quarter', ''), ci.get('actual_achievement', ''), f"{ci.get('progress_score', 0)}%", ci.get('status', '')])
                
                csv_content = output.getvalue()
                output.close()
                
                self.send_response(200)
                self.send_header('Content-type', 'text/csv')
                self.send_header('Content-Disposition', 'attachment; filename=nexus_achievement_report.csv')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(csv_content.encode('utf-8'))
                return

            else:
                return self.send_json_response(404, {"error": "Port route endpoint not found."})
        except Exception as e:
            return self.send_json_response(500, {"error": str(e)})

    def do_POST(self):
        url_path = urlparse(self.path).path
        supabase = get_db()
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}
            
            # 1. POST: Employee Goal Sheet Submissions
            if url_path == "/api/submit_goals":
                goals = data.get('goals', [])
                user_id = data.get('user_id', 'demo-employee-001')
                if not goals or len(goals) > 8:
                    return self.send_json_response(400, {"error": "Validation breach: Core constraint out of bounds."})
                
                # Delete existing unapproved drafts to prevent duplicates
                supabase.table('goals').delete().eq('user_id', user_id).eq('is_locked', False).execute()
                
                records = []
                for g in goals:
                    records.append({
                        "user_id": user_id, "title": g['title'], "thrust_area": g['thrustArea'],
                        "uom_type": g['uom'], "target": str(g['target']), "weightage": float(g['weightage']), "is_locked": False
                    })
                res = supabase.table('goals').insert(records).execute()
                return self.send_json_response(200, {"success": True, "data": res.data})

            # 2. POST: Manager Row Action Verification
            elif url_path == "/api/manager_action":
                goal_id = data.get('goal_id')
                action = data.get('action')
                manager_id = data.get('manager_id', 'demo-manager-l1')
                
                if action == 'approve':
                    update_fields = {"is_locked": True}
                    if data.get('edited_target'): update_fields["target"] = str(data.get('edited_target'))
                    if data.get('edited_weightage'): update_fields["weightage"] = float(data.get('edited_weightage'))
                    
                    supabase.table('goals').update(update_fields).eq('id', goal_id).execute()
                    supabase.table('audit_logs').insert({"goal_id": goal_id, "changed_by": manager_id, "change_description": "Manager Authorized and Locked Goal"}).execute()
                elif action == 'return':
                    supabase.table('audit_logs').insert({"goal_id": goal_id, "changed_by": manager_id, "change_description": "Returned Goal for Rework"}).execute()
                
                return self.send_json_response(200, {"success": True})

            # 3. POST: Progress Telemetry Calculator Math
            elif url_path == "/api/calculate_progress":
                goal_id = data.get('goal_id')
                quarter = data.get('quarter')
                actual = data.get('actual_achievement')
                status = data.get('status')
                
                goal_res = supabase.table('goals').select('*').eq('id', goal_id).single().execute()
                goal = goal_res.data
                uom = goal.get('uom_type')
                target = goal.get('target')
                
                score = 0.0
                if uom in ['Min_Numeric', 'Min_Percent']: score = (float(actual) / float(target)) * 100
                elif uom in ['Max_Numeric', 'Max_Percent']: score = (float(target) / float(actual)) * 100 if float(actual) != 0 else 0
                elif uom == 'Zero': score = 100.0 if float(actual) == 0 else 0.0
                elif uom == 'Timeline': score = 100.0 if datetime.strptime(actual, "%Y-%m-%d") <= datetime.strptime(target, "%Y-%m-%d") else 0.0

                rounded_score = round(score, 2)
                
                # Cascade Sync Engine
                linked_goals = supabase.table('goals').select('id').eq('parent_goal_id', goal_id).execute()
                all_ids = [goal_id] + [g['id'] for g in linked_goals.data]
                
                for t_id in all_ids:
                    existing = supabase.table('check_ins').select('*').eq('goal_id', t_id).eq('quarter', quarter).execute()
                    record = {"goal_id": t_id, "quarter": quarter, "actual_achievement": str(actual), "progress_score": rounded_score, "status": status}
                    if existing.data:
                        supabase.table('check_ins').update(record).eq('id', existing.data[0]['id']).execute()
                    else:
                        supabase.table('check_ins').insert(record).execute()
                        
                return self.send_json_response(200, {"success": True, "score": rounded_score})

            # 4. POST: Departmental KPI Broadcaster
            elif url_path == "/api/push_shared_goal":
                parent_res = supabase.table('goals').insert({
                    "user_id": data.get('manager_id'), "title": data.get('title'), "thrust_area": data.get('thrust_area'),
                    "uom_type": data.get('uom_type'), "target": str(data.get('target')), "weightage": 10, "is_shared": True
                }).execute()
                p_id = parent_res.data[0]['id']
                
                child_records = [{
                    "user_id": e_id, "parent_goal_id": p_id, "title": data.get('title'), "thrust_area": data.get('thrust_area'),
                    "uom_type": data.get('uom_type'), "target": str(data.get('target')), "weightage": 10, "is_shared": True
                } for e_id in data.get('employee_ids', [])]
                supabase.table('goals').insert(child_records).execute()
                return self.send_json_response(200, {"success": True})

            # 5. POST: Emergency Unlock Override
            elif url_path == "/api/unlock_goal":
                supabase.table('goals').update({"is_locked": False}).eq('id', data.get('goal_id')).execute()
                supabase.table('audit_logs').insert({"goal_id": data.get('goal_id'), "changed_by": data.get('admin_id', 'ADMIN'), "change_description": "Disengaged Security Lock Override"}).execute()
                return self.send_json_response(200, {"success": True})

            # 6. POST: Review Text Logging
            elif url_path == "/api/submit_comment":
                supabase.table('check_ins').update({"manager_comment": data.get('comment')}).eq('id', data.get('check_in_id')).execute()
                return self.send_json_response(200, {"success": True})

            # 7. POST: Escalation Rules Trigger Sweep
            elif url_path == "/api/run_escalations":
                unapproved = supabase.table('goals').select('*, users(full_name)').eq('is_locked', False).execute()
                for goal in unapproved.data:
                    emp_id = goal.get('user_id')
                    existing_logs = supabase.table('escalation_logs').select('*').eq('user_id', emp_id).execute()
                    lvl = len(existing_logs.data) + 1
                    if lvl <= 3:
                        supabase.table('escalation_logs').insert({"user_id": emp_id, "escalation_level": lvl, "alert_message": f"Escalation Trigger Level 0{lvl} applied for target sheet items."}).execute()
                return self.send_json_response(200, {"success": True})

            else:
                return self.send_json_response(404, {"error": "Endpoint action variant not registered."})
        except Exception as e:
            return self.send_json_response(500, {"error": str(e)})

    def send_json_response(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()