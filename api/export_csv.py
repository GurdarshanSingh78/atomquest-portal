import json
import csv
import io
from http.server import BaseHTTPRequestHandler
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            supabase = get_db()
            response = supabase.table('goals').select('title, thrust_area, uom_type, target, weightage, user_id, check_ins(quarter, actual_achievement, progress_score, status)').execute()
            
            goals_data = response.data
            output = io.StringIO()
            writer = csv.writer(output)
            
            writer.writerow(['Employee ID', 'Thrust Area', 'Goal Title', 'UoM Type', 'Weightage %', 'Planned Target', 'Reporting Quarter', 'Actual Achievement', 'Computed Progress Score', 'Status'])
            
            for goal in goals_data:
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
                        writer.writerow([
                            emp_id, area, title, uom, weight, target,
                            ci.get('quarter', ''),
                            ci.get('actual_achievement', ''),
                            f"{ci.get('progress_score', 0)}%",
                            ci.get('status', '')
                        ])
            
            csv_content = output.getvalue()
            output.close()
            
            self.send_response(200)
            self.send_header('Content-type', 'text/csv')
            self.send_header('Content-Disposition', 'attachment; filename=nexus_achievement_report.csv')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(csv_content.encode('utf-8'))
            return
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))