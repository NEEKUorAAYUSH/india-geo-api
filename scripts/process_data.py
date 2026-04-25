import csv
import glob
import os
import sys

# Try to import required libraries
try:
    import xlrd
except ImportError:
    os.system("pip3 install xlrd --break-system-packages -q")
    import xlrd

try:
    import pandas as pd
except ImportError:
    os.system("pip3 install pandas odfpy openpyxl --break-system-packages -q")
    import pandas as pd

OUTPUT_CSV = "scripts/all_india_villages.csv"
OUTPUT_SQL = "scripts/seed_data.sql"

def clean_str(val):
    if val is None: return ""
    s = str(val).strip()
    if s.endswith(".0"): s = s[:-2]
    return s.title()

def clean_code(val):
    s = str(val).strip().split(".")[0].strip()
    return s if s else "0"

def read_xls_file(filepath):
    rows = []
    wb = xlrd.open_workbook(filepath)
    ws = wb.sheet_by_index(0)
    for i in range(1, ws.nrows):
        row = ws.row_values(i)
        if len(row) < 8: continue
        rows.append({
            "state_code": clean_code(row[0]), "state_name": clean_str(row[1]),
            "district_code": clean_code(row[2]), "district_name": clean_str(row[3]),
            "subdistrict_code": clean_code(row[4]), "subdistrict_name": clean_str(row[5]),
            "village_code": clean_code(row[6]), "area_name": clean_str(row[7]),
        })
    return rows

def read_ods_file(filepath):
    rows = []
    df = pd.read_excel(filepath, engine="odf", header=0)
    df.columns = ["state_code", "state_name", "district_code", "district_name",
                  "subdistrict_code", "subdistrict_name", "village_code", "area_name"]
    for _, row in df.iterrows():
        rows.append({
            "state_code": clean_code(row["state_code"]), "state_name": clean_str(row["state_name"]),
            "district_code": clean_code(row["district_code"]), "district_name": clean_str(row["district_name"]),
            "subdistrict_code": clean_code(row["subdistrict_code"]), "subdistrict_name": clean_str(row["subdistrict_name"]),
            "village_code": clean_code(row["village_code"]), "area_name": clean_str(row["area_name"]),
        })
    return rows

def process_all_files(dataset_dir="dataset"):
    all_rows = []
    files = sorted(glob.glob(f"{dataset_dir}/*.xls") + glob.glob(f"{dataset_dir}/*.ods"))
    if not files:
        print(f"❌ No files found in '{dataset_dir}/' folder")
        sys.exit(1)
    print(f"📂 Found {len(files)} state files")
    for filepath in files:
        try:
            rows = read_ods_file(filepath) if filepath.endswith(".ods") else read_xls_file(filepath)
            all_rows.extend(rows)
        except Exception as e:
            print(f"  ❌ Error reading {os.path.basename(filepath)}: {e}")
    return all_rows

def generate_sql(all_rows):
    states, districts, subdistricts, villages = {}, {}, {}, []
    
    for row in all_rows:
        sc = row["state_code"]
        dc = row["district_code"]
        sdc = row["subdistrict_code"]
        vc = row["village_code"]
        
        # 1. FORCE every state referenced to exist
        if sc not in states: 
            states[sc] = row["state_name"] or f"Unknown State {sc}"
            
        # 2. FORCE every district referenced to exist
        if f"{sc}_{dc}" not in districts: 
            districts[f"{sc}_{dc}"] = {"code": dc, "name": row["district_name"] or f"Unknown District {dc}", "state_code": sc}
            
        # 3. FORCE every subdistrict referenced to exist
        if f"{sc}_{dc}_{sdc}" not in subdistricts: 
            subdistricts[f"{sc}_{dc}_{sdc}"] = {"code": sdc, "name": row["subdistrict_name"] or f"Unknown Sub {sdc}", "district_code": dc, "state_code": sc}
        
        # 4. Add the village
        if vc not in ("0", "000000", ""): 
            villages.append({"code": vc, "name": row["area_name"], "subdistrict_code": sdc, "district_code": dc, "state_code": sc})

    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        # States
        f.write('INSERT INTO states ("code", "name") VALUES\n')
        state_vals = []
        for code, name in sorted(states.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 0):
            safe_name = name.replace("'", "''")
            state_vals.append(f"('{code}', '{safe_name}')")
        if state_vals:
            f.write(",\n".join(state_vals))
            f.write('\nON CONFLICT ("code") DO NOTHING;\n\n')

        # Districts
        f.write('INSERT INTO districts ("code", "name", "stateCode") VALUES\n')
        dist_vals = []
        for d in districts.values():
            safe_name = d["name"].replace("'", "''")
            dist_vals.append(f"('{d['code']}', '{safe_name}', '{d['state_code']}')")
        if dist_vals:
            f.write(",\n".join(dist_vals))
            f.write('\nON CONFLICT ("code", "stateCode") DO NOTHING;\n\n')

        # Sub-districts
        f.write('INSERT INTO subdistricts ("code", "name", "districtCode", "stateCode") VALUES\n')
        sub_vals = []
        for s in subdistricts.values():
            safe_name = s["name"].replace("'", "''")
            sub_vals.append(f"('{s['code']}', '{safe_name}', '{s['district_code']}', '{s['state_code']}')")
        if sub_vals:
            f.write(",\n".join(sub_vals))
            f.write('\nON CONFLICT ("code", "districtCode") DO NOTHING;\n\n')

        # Villages (Batched)
        batch_size = 1000
        for i in range(0, len(villages), batch_size):
            batch = villages[i:i + batch_size]
            f.write('INSERT INTO villages ("code", "name", "subdistrictCode", "districtCode", "stateCode") VALUES\n')
            vill_vals = []
            for v in batch:
                safe_name = v["name"].replace("'", "''")
                vill_vals.append(f"('{v['code']}', '{safe_name}', '{v['subdistrict_code']}', '{v['district_code']}', '{v['state_code']}')")
            f.write(",\n".join(vill_vals))
            f.write('\nON CONFLICT ("code", "subdistrictCode") DO NOTHING;\n\n')

    print(f"✅ SQL written: {OUTPUT_SQL}")

if __name__ == "__main__":
    all_rows = process_all_files()
    generate_sql(all_rows)
    print("\n🎉 Done! Copy the contents of scripts/seed_data.sql into your NeonDB SQL Editor.")