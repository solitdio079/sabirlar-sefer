import pool from "./pool.js";

async function ensureOdemeHavaleSentColumn(){
    await pool.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_name = 'odeme'
            ) THEN
                ALTER TABLE odeme ADD COLUMN IF NOT EXISTS havale_sent BOOLEAN NOT NULL DEFAULT false;
            END IF;
        END $$;
    `)
}

async function ensureFeatureRequestTable(){
    await pool.query(`
        CREATE TABLE IF NOT EXISTS feature_request (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            title TEXT NOT NULL,
            description TEXT,
            implemented BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `)
}

async function ensurePayrollTables(){
    await pool.query(`
        CREATE TABLE IF NOT EXISTS personel (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT NOT NULL,
            tckn TEXT,
            role TEXT,
            official_gross_salary NUMERIC NOT NULL DEFAULT 0,
            agreed_total_salary NUMERIC NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS bordro (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            personel_id INTEGER REFERENCES personel(id) ON DELETE CASCADE,
            payroll_month TEXT NOT NULL,
            official_gross_salary NUMERIC NOT NULL DEFAULT 0,
            official_net_salary NUMERIC NOT NULL DEFAULT 0,
            agreed_total_salary NUMERIC NOT NULL DEFAULT 0,
            working_days NUMERIC NOT NULL DEFAULT 26,
            overtime_days NUMERIC NOT NULL DEFAULT 0,
            overtime_hours NUMERIC NOT NULL DEFAULT 0,
            advance_payment NUMERIC NOT NULL DEFAULT 0,
            icra_deduction NUMERIC NOT NULL DEFAULT 0,
            prior_cumulative_tax_base NUMERIC NOT NULL DEFAULT 0,
            minimum_wage_paid BOOLEAN NOT NULL DEFAULT false,
            salary_extra_amount NUMERIC NOT NULL DEFAULT 0,
            salary_extra_sent BOOLEAN NOT NULL DEFAULT false,
            payment_type TEXT NOT NULL DEFAULT 'Havale',
            notes TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        ALTER TABLE bordro ADD COLUMN IF NOT EXISTS working_days NUMERIC NOT NULL DEFAULT 26;
        ALTER TABLE bordro ADD COLUMN IF NOT EXISTS overtime_days NUMERIC NOT NULL DEFAULT 0;
        ALTER TABLE bordro ADD COLUMN IF NOT EXISTS overtime_hours NUMERIC NOT NULL DEFAULT 0;
        ALTER TABLE bordro ADD COLUMN IF NOT EXISTS advance_payment NUMERIC NOT NULL DEFAULT 0;
        ALTER TABLE bordro ADD COLUMN IF NOT EXISTS icra_deduction NUMERIC NOT NULL DEFAULT 0;
        ALTER TABLE bordro ADD COLUMN IF NOT EXISTS prior_cumulative_tax_base NUMERIC NOT NULL DEFAULT 0;
    `)
}

async function populatePersonelFromDrivers(){
    await pool.query(`
        INSERT INTO personel (name,tckn,role,official_gross_salary,agreed_total_salary)
        SELECT d.name, d.tckn, 'Şoför', 33030, 28075.50
        FROM driver d
        WHERE NOT EXISTS (
            SELECT 1
            FROM personel p
            WHERE p.tckn = d.tckn
               OR (p.tckn IS NULL AND p.name = d.name)
               OR (p.tckn = '' AND p.name = d.name)
        )
    `)
}

async function setAllPersonelMinimumWage(){
    await pool.query(`UPDATE personel SET official_gross_salary=$1, agreed_total_salary=$2`,[33030,28075.50])
}

// Sefer 

async function getAllSefer(){
    const {rows} = await pool.query("SELECT * FROM sefer ORDER BY id DESC")
    return rows
}

async function getOneSefer(id){
    const {rows} = await pool.query("SELECT * FROM sefer WHERE id=$1",[id])
    return rows[0]
}

async function editSefer(id,name,price){
    await pool.query(`UPDATE sefer SET name=$1, price=$2 WHERE id=$3`,[name,price,id])
}

async function createSefer(name,price){
    await pool.query(`INSERT INTO sefer (name,price) VALUES ($1,$2)`,[name,price])
}

async function createDriver(name,tckn){
    await pool.query(`INSERT INTO driver (name,tckn) VALUES ($1,$2)`,[name,tckn])
}

async function getAllDrivers(){
    const {rows} = await pool.query("SELECT * FROM driver ORDER BY name ASC")
    return rows
}

async function getOneDriver(id){
    const {rows} = await pool.query("SELECT * FROM driver WHERE id=$1",[id])
    return rows[0]
}

async function editDriver(id,name,tckn){
    await pool.query(`UPDATE driver SET name=$1, tckn=$2 WHERE id=$3`,[name,tckn,id])
}

async function deleteDriver(id){
    await pool.query(`DELETE FROM driver WHERE id=$1`,[id])
}
async function deleteSefer(id){
    await pool.query(`DELETE FROM sefer WHERE id=$1`,[id])
}

async function searchDriver(query){
    const {rows} = await pool.query(`SELECT * FROM driver WHERE name ILIKE $1`,[`%${query}%`])
    return rows
}
async function searchSefer(query){
    const {rows} = await pool.query(`SELECT * FROM sefer WHERE name ILIKE $1`,[`%${query}%`])
    return rows
}

//

async function createOdeme(sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty){
    await pool.query(`INSERT INTO odeme (sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,[sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty])

}

async function getAllOdeme(){
    const {rows} = await pool.query(`SELECT * FROM odeme`)
    return rows
}
async function getOneOdeme(id){
    const {rows} = await pool.query(`SELECT * FROM odeme WHERE id=$1`,[id])
    return rows[0]
}

async function getDriverOdeme(driverId){
    const {rows} = await pool.query(`SELECT * FROM odeme WHERE driver_id = $1`,[driverId])
    return rows
}
async function getSeferOdeme(seferId){
    const {rows} = await pool.query(`SELECT * FROM odeme WHERE sefer_id = $1`,[seferId])
    return rows
}

async function updateOdeme(id,sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty){
    await pool.query(`UPDATE odeme SET sefer_date=$1,sefer_id=$2,sefer_name=$3,sefer_price=$4,driver_id=$5,driver_name=$6,pay_type=$7,payout=$8,sefer_qty=$9,havale_sent=CASE WHEN $7 = 'Havale' THEN havale_sent ELSE false END WHERE id=$10`,[sefer_date,sefer_id,sefer_name,sefer_price,driver_id,driver_name,pay_type,payout,sefer_qty,id])
}

async function updateHavaleSent(id,havaleSent){
    await pool.query(`UPDATE odeme SET havale_sent=$1 WHERE id=$2 AND pay_type='Havale'`,[havaleSent,id])
}

async function deleteOdeme(id){
    await pool.query(`DELETE FROM odeme WHERE id=$1`,[id])
}

async function getAllFeatureRequests(){
    const {rows} = await pool.query(`SELECT * FROM feature_request ORDER BY implemented ASC, created_at DESC`)
    return rows
}

async function createFeatureRequest(title,description){
    await pool.query(`INSERT INTO feature_request (title,description) VALUES ($1,$2)`,[title,description])
}

async function updateFeatureImplemented(id,implemented){
    await pool.query(`UPDATE feature_request SET implemented=$1 WHERE id=$2`,[implemented,id])
}

async function getAllPersonel(){
    const {rows} = await pool.query(`SELECT * FROM personel ORDER BY name ASC`)
    return rows
}

async function getOnePersonel(id){
    const {rows} = await pool.query(`SELECT * FROM personel WHERE id=$1`,[id])
    return rows[0]
}

async function createPersonel(name,tckn,role,officialGrossSalary,agreedTotalSalary){
    await pool.query(`INSERT INTO personel (name,tckn,role,official_gross_salary,agreed_total_salary) VALUES ($1,$2,$3,$4,$5)`,[name,tckn,role,officialGrossSalary,agreedTotalSalary])
}

async function updatePersonel(id,name,tckn,role,officialGrossSalary,agreedTotalSalary){
    await pool.query(`UPDATE personel SET name=$1,tckn=$2,role=$3,official_gross_salary=$4,agreed_total_salary=$5 WHERE id=$6`,[name,tckn,role,officialGrossSalary,agreedTotalSalary,id])
}

async function deletePersonel(id){
    await pool.query(`DELETE FROM personel WHERE id=$1`,[id])
}

async function getBordroList(month){
    const params = []
    let where = ""
    if(month){
        params.push(month)
        where = "WHERE b.payroll_month = $1"
    }

    const {rows} = await pool.query(`
        SELECT b.*, p.name AS personel_name, p.tckn, p.role
        FROM bordro b
        JOIN personel p ON p.id = b.personel_id
        ${where}
        ORDER BY b.payroll_month DESC, p.name ASC
    `,params)
    return rows
}

async function getOneBordro(id){
    const {rows} = await pool.query(`
        SELECT b.*, p.name AS personel_name, p.tckn, p.role
        FROM bordro b
        JOIN personel p ON p.id = b.personel_id
        WHERE b.id=$1
    `,[id])
    return rows[0]
}

async function createBordro(personelId,payrollMonth,officialGrossSalary,officialNetSalary,agreedTotalSalary,salaryExtraAmount,workingDays,overtimeDays,overtimeHours,advancePayment,icraDeduction,priorCumulativeTaxBase,paymentType,notes){
    await pool.query(`INSERT INTO bordro (personel_id,payroll_month,official_gross_salary,official_net_salary,agreed_total_salary,salary_extra_amount,working_days,overtime_days,overtime_hours,advance_payment,icra_deduction,prior_cumulative_tax_base,payment_type,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,[personelId,payrollMonth,officialGrossSalary,officialNetSalary,agreedTotalSalary,salaryExtraAmount,workingDays,overtimeDays,overtimeHours,advancePayment,icraDeduction,priorCumulativeTaxBase,paymentType,notes])
}

async function updateBordro(id,payrollMonth,officialGrossSalary,officialNetSalary,agreedTotalSalary,salaryExtraAmount,workingDays,overtimeDays,overtimeHours,advancePayment,icraDeduction,priorCumulativeTaxBase,paymentType,notes){
    await pool.query(`UPDATE bordro SET payroll_month=$1,official_gross_salary=$2,official_net_salary=$3,agreed_total_salary=$4,salary_extra_amount=$5,working_days=$6,overtime_days=$7,overtime_hours=$8,advance_payment=$9,icra_deduction=$10,prior_cumulative_tax_base=$11,payment_type=$12,notes=$13 WHERE id=$14`,[payrollMonth,officialGrossSalary,officialNetSalary,agreedTotalSalary,salaryExtraAmount,workingDays,overtimeDays,overtimeHours,advancePayment,icraDeduction,priorCumulativeTaxBase,paymentType,notes,id])
}

async function updateBordroMinimumPaid(id,minimumWagePaid){
    await pool.query(`UPDATE bordro SET minimum_wage_paid=$1 WHERE id=$2`,[minimumWagePaid,id])
}

async function updateBordroExtraSent(id,salaryExtraSent){
    await pool.query(`UPDATE bordro SET salary_extra_sent=$1 WHERE id=$2`,[salaryExtraSent,id])
}

async function deleteBordro(id){
    await pool.query(`DELETE FROM bordro WHERE id=$1`,[id])
}

export default {ensureOdemeHavaleSentColumn, ensureFeatureRequestTable, ensurePayrollTables, populatePersonelFromDrivers, setAllPersonelMinimumWage, createOdeme, getOneOdeme,getAllOdeme,deleteOdeme,updateOdeme,updateHavaleSent,getAllOdeme,getDriverOdeme, getSeferOdeme ,createDriver, createSefer, editSefer, searchSefer,getAllSefer,  getOneSefer, deleteSefer,getAllDrivers, getOneDriver,searchDriver,deleteDriver, editDriver, getAllFeatureRequests, createFeatureRequest, updateFeatureImplemented, getAllPersonel, getOnePersonel, createPersonel, updatePersonel, deletePersonel, getBordroList, getOneBordro, createBordro, updateBordro, updateBordroMinimumPaid, updateBordroExtraSent, deleteBordro }
