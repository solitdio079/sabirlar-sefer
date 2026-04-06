import pool from "./pool.js";

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

export default { createDriver, createSefer, editSefer, searchSefer,getAllSefer,  getOneSefer, deleteSefer,getAllDrivers, getOneDriver,searchDriver,deleteDriver, editDriver }
