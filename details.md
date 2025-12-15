Build a **web-based MIS & Bank Dump Analytics Platform** where daily **MIS Excel files** and **Bank Dump Excel files** are uploaded, analyzed, mapped, and stored in a database. The system must automatically **segregate bank dump data employee-wise using ARN mapping**, provide **search**, **dashboards**, and **full data visibility**, and preserve **ALL raw columns** from both files.

---

## 🧠 CORE BUSINESS LOGIC (MANDATORY)

### Key Mapping Rules

* `MIS.ARN NO` = `DUMP.APPL_REF` (**PRIMARY JOIN KEY**)
* `MIS.CUSTOMER NAME` = `DUMP.FULL_NAME` (validation only)
* Dump file **does NOT contain employee name**
* Employee mapping comes **ONLY from MIS**

### Segregation Rule

1. MIS upload establishes:
   **ARN → Employee**
2. Dump upload attaches bank data using `APPL_REF`
3. Since ARN already belongs to an employee, **dump data is auto-segregated employee-wise**

❗ Never infer employee from dump
❗ ARN is the single source of truth

---

## 🏗️ TECH STACK (STRICT)

### Frontend

* Next.js (React)
* Tailwind CSS
* Deployed on **Vercel**

### Backend

* Node.js
* Express.js or Fastify
* Excel parsing using `xlsx` or `exceljs`
* ORM: **Prisma**

### Database

* PostgreSQL
* JSONB columns for raw data preservation

### Hosting

* Backend: **Railway or Render**
* Database: Railway / Supabase / RDS

---

## 🗄️ DATABASE SCHEMA (EXACT)

### 1️⃣ employees

```
id (PK)
name (unique)
created_at
```

---

### 2️⃣ applications (MASTER TABLE)

```
id (PK)
arn (unique, indexed)
employee_id (FK)
customer_name
mobile_no
application_date
created_at
updated_at
```

---

### 3️⃣ mis_raw_data (FULL MIS PRESERVATION)

```
id (PK)
arn
raw_json (JSONB)
upload_date
```

Store **ALL MIS columns exactly as uploaded**.

---

### 4️⃣ dump_raw_data (FULL BANK DUMP PRESERVATION)

```
id (PK)
appl_ref
raw_json (JSONB)
upload_date
```

Store **ALL bank dump columns exactly as uploaded**.

---

### 5️⃣ application_status (STRUCTURED & QUERY OPTIMIZED)

```
id (PK)
arn (FK)
bank_status
decline_description
decline_category
mis_dec_code
decision_date
activation_status
approved_flag
last_updated
```

---

### 6️⃣ upload_logs

```
id (PK)
file_type (MIS / DUMP)
record_count
uploaded_at
```

---

## 📥 FILE UPLOAD & PROCESSING LOGIC

### MIS FILE COLUMNS

```
DATE
ARN NO
CUSTOMER NAME
MOBILE NO
EMP NAME
VKYC STATUS
BKYC STATUS
DECLINE CODE
FINAL
```

### MIS Upload Flow

1. Validate required columns
2. Normalize column names
3. Insert full row into `mis_raw_data.raw_json`
4. Create employee if not exists
5. Create/update application using ARN
6. Link ARN → employee

---

### DUMP FILE COLUMNS (STORE ALL)

```
APPL_REF
SEG_ID
SETUP_STAT
FULL_NAME
APPLDATE
QDE_SUBMISSION_DATE
DECISIN_DT
CITY
CATEGORY
TEAMCD
DSA Name
Code Correction
Final Team Code
PROMOCODE_NEW
PROMOCODE_DESCRIPTION
SOURCE
SPC_CHANNEL ME
SMCODE
SM_MAST_SM_1
SM_MAST_ASM_1
SM_MAST_ZH_1
PRODUCT
PRODUCT_DESC
NEW_DSECODE_1
LC1CODE_1
LC2CODE
MISDECCODE
DECLINE_DESCRIPTION
DECLINE_CATEGORY
EFF_GAR_LOGIC
CAT2
EMPLOYER
LETTERCODE_DESC
CHECKDEFECT_DESC
APPL_NUM
SOURCE_CATEGORY
Remove Flag
tag_1
dob_prime
inhouse
dap_channe
ONEPLUS_ELIGIBILITY
Activation Status
```

---

### DUMP Upload Flow

1. Validate `APPL_REF`
2. Insert entire row into `dump_raw_data.raw_json`
3. Match `APPL_REF → applications.arn`
4. Update `application_status`
5. If ARN not found → mark as **Unmapped Dump Record**

---

## 🔍 SEARCH FEATURES (MANDATORY)

Search must work across:

* Employee Name
* ARN / APPL_REF
* Customer Name
* Mobile Number
* Status (Approved / Rejected / Pending)
* Date range

Results must show:

* Employee info
* Application info
* MIS data
* FULL dump data (expandable JSON view)

---

## 📊 DASHBOARD FEATURES

### Global Metrics

* Total applications
* Approved count
* Rejected count
* Pending count
* Approval %

### Employee-wise

* Applications filed
* Approved / Rejected
* Conversion %

### Advanced

* Rejection reason distribution
* Date-wise trends
* VKYC / BKYC funnel
* Activation Status tracking

---

## 🖥️ UI REQUIREMENTS

### Pages

1. Login
2. Upload MIS
3. Upload Dump
4. Dashboard
5. Search & Results
6. Employee Performance
7. Unmapped Records

### UI Guidelines

* Clean admin dashboard
* Filters + pagination
* Expandable JSON viewer for raw dump data
* Export to Excel (filtered data)

---

## 🔐 SECURITY & VALIDATION

* Role-based access (Admin / Viewer)
* File type validation
* Duplicate ARN prevention
* Column mismatch alerts
* Upload history logs

---

## 🚀 DEPLOYMENT REQUIREMENTS

* Frontend → Vercel
* Backend → Railway or Render
* PostgreSQL with backups
* Environment variable support
* Background processing for large Excel files

---

## ⚠️ NON-NEGOTIABLE RULES

* NEVER drop any dump column
* NEVER infer employee from dump
* ARN/APPL_REF is the ONLY join key
* Always preserve raw Excel rows
* Handle daily uploads without data loss

---

## 🔮 FUTURE-READY EXTENSIONS

* Scheduled daily uploads
* Email / WhatsApp MIS reports
* Bank-wise analytics
* SLA & TAT tracking

---

## ✅ OUTPUT EXPECTATION FROM KIRO AI

* Database schema
* Backend APIs
* Excel upload & parsing logic
* Frontend UI & dashboard
* Search functionality
* Deployment-ready code








prisma:query SELECT "public"."application_status"."id", "public"."application_status"."arn", "public"."application_status"."bank_status", "public"."application_status"."decline_description", "public"."application_status"."decline_category", "public"."application_status"."mis_dec_code", "public"."application_status"."decision_date", "public"."application_status"."activation_status", "public"."application_status"."approved_flag", "public"."application_status"."last_updated", "public"."application_status"."final_decision", "public"."application_status"."final_decision_date", "public"."application_status"."current_stage", "public"."application_status"."kyc_status", "public"."application_status"."vkyc_status", "public"."application_status"."vkyc_consent_date", "public"."application_status"."decline_code", "public"."application_status"."company_name", "public"."application_status"."product_description", "public"."application_status"."card_activation_status", "public"."application_status"."card_type" FROM "public"."application_status" WHERE "public"."application_status"."arn" IN ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63,$64,$65,$66,$67,$68,$69,$70,$71,$72,$73,$74,$75,$76,$77,$78,$79,$80,$81,$82,$83,$84,$85,$86,$87,$88,$89,$90,$91,$92,$93,$94,$95,$96,$97,$98,$99,$100,$101,$102,$103,$104,$105,$106,$107,$108,$109,$110,$111,$112,$113,$114,$115,$116,$117,$118,$119,$120,$121,$122,$123,$124,$125,$126,$127,$128,$129,$130,$131,$132,$133,$134,$135,$136,$137,$138,$139,$140,$141,$142,$143,$144,$145,$146,$147,$148,$149,$150,$151,$152,$153,$154,$155,$156,$157,$158,$159,$160,$161,$162,$163,$164,$165,$166,$167,$168,$169,$170,$171,$172,$173,$174,$175,$176,$177,$178,$179,$180,$181,$182,$183,$184,$185,$186,$187,$188,$189,$190,$191,$192,$193,$194,$195,$196,$197,$198,$199,$200,$201,$202,$203,$204,$205,$206,$207,$208,$209,$210,$211,$212,$213,$214,$215,$216,$217,$218,$219,$220,$221,$222,$223,$224,$225,$226,$227,$228,$229,$230,$231,$232,$233,$234,$235,$236,$237,$238,$239,$240,$241,$242,$243,$244,$245,$246,$247,$248,$249,$250,$251,$252,$253,$254,$255,$256,$257,$258,$259,$260,$261,$262,$263,$264,$265,$266,$267,$268,$269,$270,$271,$272,$273,$274,$275,$276,$277,$278,$279,$280,$281,$282,$283,$284,$285,$286,$287,$288,$289,$290,$291,$292,$293,$294,$295,$296,$297,$298,$299,$300,$301,$302,$303,$304,$305,$306,$307,$308,$309,$310,$311,$312,$313,$314,$315,$316,$317,$318,$319,$320,$321,$322,$323,$324,$325,$326,$327,$328,$329,$330,$331,$332,$333,$334,$335,$336,$337,$338,$339,$340,$341,$342,$343,$344,$345,$346,$347,$348,$349,$350,$351,$352,$353,$354,$355,$356,$357,$358,$359,$360,$361,$362,$363,$364,$365,$366,$367,$368,$369,$370,$371,$372,$373,$374,$375,$376,$377,$378,$379,$380,$381,$382,$383,$384,$385,$386,$387,$388,$389,$390,$391,$392,$393,$394,$395,$396,$397,$398,$399,$400,$401,$402,$403,$404,$405,$406,$407,$408,$409,$410,$411,$412,$413,$414,$415,$416,$417,$418,$419,$420,$421,$422,$423,$424,$425,$426,$427,$428,$429,$430,$431,$432,$433,$434,$435,$436,$437,$438,$439,$440,$441,$442,$443,$444,$445,$446,$447,$448,$449,$450,$451,$452,$453,$454,$455,$456,$457,$458,$459,$460,$461,$462,$463,$464,$465,$466,$467,$468,$469,$470,$471,$472,$473,$474,$475,$476,$477,$478,$479,$480,$481,$482,$483,$484,$485,$486,$487,$488,$489,$490,$491,$492,$493,$494,$495,$496,$497,$498,$499,$500,$501,$502,$503,$504,$505,$506,$507,$508,$509,$510,$511,$512,$513,$514,$515,$516,$517,$518,$519,$520,$521,$522,$523,$524,$525,$526,$527,$528,$529,$530,$531,$532,$533,$534,$535,$536,$537,$538,$539,$540,$541,$542,$543,$544,$545,$546,$547,$548,$549,$550,$551,$552,$553,$554,$555,$556,$557,$558,$559,$560,$561,$562,$563,$564) OFFSET $565
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."role", "public"."users"."name" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3   
prisma:query 
      SELECT
        DATE(application_date) as date,
        COUNT(*) as total_applications,
        COUNT(CASE WHEN ast.approved_flag = true THEN 1 END) as approved,
        COUNT(CASE WHEN ast.approved_flag = false AND ast.decline_description IS NOT NULL THEN 1 END) as rejected
      FROM applications a
      LEFT JOIN application_status ast ON a.arn = ast.arn
      WHERE a.application_date >= $1
      GROUP BY DATE(application_date)
      ORDER BY date DESC
      LIMIT 30

Trends error: TypeError: Do not know how to serialize a BigInt
    at JSON.stringify (<anonymous>)
    at stringify (C:\Users\Ai\ai pro\excel auto\backend\node_modules\express\lib\response.js:1160:12) 
    at ServerResponse.json (C:\Users\Ai\ai pro\excel auto\backend\node_modules\express\lib\response.js:271:14)
    at C:\Users\Ai\ai pro\excel auto\backend\src\routes\dashboard.js:234:9
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."role", "public"."users"."name" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3   
prisma:query 
      SELECT
        DATE(application_date) as date,
        COUNT(*) as total_applications,
        COUNT(CASE WHEN ast.approved_flag = true THEN 1 END) as approved,
        COUNT(CASE WHEN ast.approved_flag = false AND ast.decline_description IS NOT NULL THEN 1 END) as rejected
      FROM applications a
      LEFT JOIN application_status ast ON a.arn = ast.arn
      WHERE a.application_date >= $1
      GROUP BY DATE(application_date)
      ORDER BY date DESC
      LIMIT 30

Trends error: TypeError: Do not know how to serialize a BigInt
    at JSON.stringify (<anonymous>)
    at stringify (C:\Users\Ai\ai pro\excel auto\backend\node_modules\express\lib\response.js:1160:12) 
    at ServerResponse.json (C:\Users\Ai\ai pro\excel auto\backend\node_modules\express\lib\response.js:271:14)
    at C:\Users\Ai\ai pro\excel auto\backend\src\routes\dashboard.js:234:9
prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."role", "public"."users"."name" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3   
prisma:query 
      SELECT
        DATE(application_date) as date,
        COUNT(*) as total_applications,
        COUNT(CASE WHEN ast.approved_flag = true THEN 1 END) as approved,
        COUNT(CASE WHEN ast.approved_flag = false AND ast.decline_description IS NOT NULL THEN 1 END) as rejected
      FROM applications a
      LEFT JOIN application_status ast ON a.arn = ast.arn
      WHERE a.application_date >= $1
      GROUP BY DATE(application_date)
      ORDER BY date DESC
      LIMIT 30

Trends error: TypeError: Do not know how to serialize a BigInt
    at JSON.stringify (<anonymous>)
    at stringify (C:\Users\Ai\ai pro\excel auto\backend\node_modules\express\lib\response.js:1160:12) 
    at ServerResponse.json (C:\Users\Ai\ai pro\excel auto\backend\node_modules\express\lib\response.js:271:14)
    at C:\Users\Ai\ai pro\excel auto\backend\src\routes\dashboard.js:234:9
prisma:query SELECT 1