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

export default {ensureOdemeHavaleSentColumn, createOdeme, getOneOdeme,getAllOdeme,deleteOdeme,updateOdeme,updateHavaleSent,getAllOdeme,getDriverOdeme, getSeferOdeme ,createDriver, createSefer, editSefer, searchSefer,getAllSefer,  getOneSefer, deleteSefer,getAllDrivers, getOneDriver,searchDriver,deleteDriver, editDriver }
