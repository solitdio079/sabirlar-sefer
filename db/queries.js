import pool from "./pool.js";

// Malzeme 

async function getAllMalzeme(){
    const {rows} = await pool.query(`SELECT * FROM malzeme ORDER BY name ASC`)
    return rows
}
async function getOneMalzeme(id){
    const {rows} = await pool.query(`SELECT * FROM malzeme WHERE id=$1`,[id])
    return rows[0]
}

async function createMalzeme(name,price){
    await pool.query(`INSERT INTO malzeme (name,price) VALUES ($1,$2)`,[name,price])
}

async function updateMalzeme(id,name,price){
    await pool.query(`UPDATE malzeme SET name=$1,price=$2 WHERE id=$3`,[name,price,id])
}

async function deleteMalzeme(id){
    await pool.query(`DELETE FROM malzeme WHERE id=$1`,[id])
}

async function searchMalzeme(query){
    const {rows} =await pool.query(`SELECT * FROM malzeme WHERE name ILIKE $1`,[`%${query}%`])
    return rows
}

// Sefer

async function createSefer(driver_name,malzeme_id,pay_type,date,total_payout,sefer_qty){
    await pool.query(`INSERT INTO sefer (driver_name,malzeme_id,pay_type,date,total_payout,sefer_qty) VALUES ($1,$2,$3,$4,$5,$6)`,[driver_name,malzeme_id,pay_type,date,total_payout,sefer_qty])
}
async function updateSefer(id,driver_name,malzeme_id,pay_type,total_payout,sefer_qty){
    await pool.query(`UPDATE sefer SET driver_name=$1,malzeme_id=$2,pay_type=$3,total_payout=$4,sefer_qty=$5 WHERE id=$6`,[driver_name,malzeme_id,pay_type,total_payout,sefer_qty,id])
}
async function getMalzemeSefer(malzeme_id){
    const {rows} =  await pool.query(`SELECT * FROM sefer WHERE malzeme_id=$1 ORDER BY date DESC`,[malzeme_id])
    return rows
}

async function getTotalAmount(malzeme_id){
    const {rows} = await pool.query(`SELECT malzeme_id, SUM(total_payout) AS sum_payout FROM sefer GROUP BY malzeme_id HAVING malzeme_id=$1`,[malzeme_id])
    return rows[0]
}

async function getOneSefer(id){
    const {rows} = await pool.query(`SELECT * FROM sefer WHERE id=$1`,[id])
    return rows[0]
}

async function searchSefer(malzeme_id,query){
    const {rows} = await pool.query(`SELECT * FROM sefer WHERE driver_name ILIKE $1 AND malzeme_id=$2 ORDER BY date DESC`,[`%${query}%`,malzeme_id])
    return rows
}
async function deleteSefer(id){
    await pool.query(`DELETE FROM sefer WHERE id=$1`,[id])
}
export default { getAllMalzeme, createMalzeme, updateMalzeme, getOneMalzeme,deleteMalzeme,createSefer,getMalzemeSefer,searchMalzeme,searchSefer,updateSefer,getTotalAmount, getOneSefer,deleteSefer }
