import { body, matchedData, validationResult } from "express-validator"
import db from "../db/queries.js"

const parseBooleanField = (value) => Array.isArray(value)
    ? value.includes("true")
    : value === "true"

const PAYROLL_RATES_2026 = {
    minimumGrossSalary: 33030,
    sgkEmployeeRate: 0.14,
    unemploymentEmployeeRate: 0.01,
    stampTaxRate: 0.00759,
    incomeTaxExemption: 4211.33,
    stampTaxExemption: 250.70,
    workingDays: 26,
    dailyHours: 7.5,
    overtimeMultiplier: 1.5,
    incomeTaxBrackets: [
        {limit: 190000, base: 0, floor: 0, rate: 0.15},
        {limit: 400000, base: 28500, floor: 190000, rate: 0.20},
        {limit: 1500000, base: 70500, floor: 400000, rate: 0.27},
        {limit: 5300000, base: 367500, floor: 1500000, rate: 0.35},
        {limit: Infinity, base: 1697500, floor: 5300000, rate: 0.40}
    ]
}

const money = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
const formatMoney = (value) => money(value).toFixed(2)

function calculateAnnualIncomeTax(taxBase){
    const bracket = PAYROLL_RATES_2026.incomeTaxBrackets.find((item) => taxBase <= item.limit)
    return money(bracket.base + ((taxBase - bracket.floor) * bracket.rate))
}

function calculateBordro(bordro){
    const officialGrossSalary = Number(bordro.official_gross_salary || 0)
    const agreedTotalSalary = Number(bordro.agreed_total_salary || 0)
    const workingDays = Number(bordro.working_days || PAYROLL_RATES_2026.workingDays)
    const overtimeDays = Number(bordro.overtime_days || 0)
    const overtimeHours = Number(bordro.overtime_hours || 0)
    const advancePayment = Number(bordro.advance_payment || 0)
    const icraDeduction = Number(bordro.icra_deduction || 0)
    const priorCumulativeTaxBase = Number(bordro.prior_cumulative_tax_base || 0)
    const dailyGross = workingDays > 0 ? officialGrossSalary / workingDays : 0
    const hourlyGross = dailyGross / PAYROLL_RATES_2026.dailyHours
    const overtimeDayGross = dailyGross * overtimeDays * PAYROLL_RATES_2026.overtimeMultiplier
    const overtimeHourGross = hourlyGross * overtimeHours * PAYROLL_RATES_2026.overtimeMultiplier
    const overtimeGross = overtimeDayGross + overtimeHourGross
    const grossEarnings = officialGrossSalary + overtimeGross
    const sgkEmployee = grossEarnings * PAYROLL_RATES_2026.sgkEmployeeRate
    const unemploymentEmployee = grossEarnings * PAYROLL_RATES_2026.unemploymentEmployeeRate
    const incomeTaxBase = grossEarnings - sgkEmployee - unemploymentEmployee
    const cumulativeTaxBase = priorCumulativeTaxBase + incomeTaxBase
    const incomeTaxBeforeExemption = calculateAnnualIncomeTax(cumulativeTaxBase) - calculateAnnualIncomeTax(priorCumulativeTaxBase)
    const incomeTax = Math.max(incomeTaxBeforeExemption - PAYROLL_RATES_2026.incomeTaxExemption, 0)
    const stampTaxBeforeExemption = grossEarnings * PAYROLL_RATES_2026.stampTaxRate
    const stampTax = Math.max(stampTaxBeforeExemption - PAYROLL_RATES_2026.stampTaxExemption, 0)
    const officialNetSalary = grossEarnings - sgkEmployee - unemploymentEmployee - incomeTax - stampTax
    const salaryExtraAmount = Math.max(agreedTotalSalary - officialNetSalary, 0)
    const totalSalaryTarget = officialNetSalary + salaryExtraAmount
    const payoutAmount = Math.max(totalSalaryTarget - advancePayment - icraDeduction, 0)

    return {
        officialGrossSalary: money(officialGrossSalary),
        dailyGross: money(dailyGross),
        hourlyGross: money(hourlyGross),
        overtimeDayGross: money(overtimeDayGross),
        overtimeHourGross: money(overtimeHourGross),
        overtimeGross: money(overtimeGross),
        grossEarnings: money(grossEarnings),
        sgkEmployee: money(sgkEmployee),
        unemploymentEmployee: money(unemploymentEmployee),
        incomeTaxBase: money(incomeTaxBase),
        priorCumulativeTaxBase: money(priorCumulativeTaxBase),
        cumulativeTaxBase: money(cumulativeTaxBase),
        incomeTaxBeforeExemption: money(incomeTaxBeforeExemption),
        incomeTaxExemption: money(Math.min(incomeTaxBeforeExemption, PAYROLL_RATES_2026.incomeTaxExemption)),
        incomeTax: money(incomeTax),
        stampTaxBeforeExemption: money(stampTaxBeforeExemption),
        stampTaxExemption: money(Math.min(stampTaxBeforeExemption, PAYROLL_RATES_2026.stampTaxExemption)),
        stampTax: money(stampTax),
        officialNetSalary: money(officialNetSalary),
        salaryExtraAmount: money(salaryExtraAmount),
        advancePayment: money(advancePayment),
        icraDeduction: money(icraDeduction),
        totalSalaryTarget: money(totalSalaryTarget),
        payoutAmount: money(payoutAmount)
    }
}

function formatCalculations(calculations){
    return Object.fromEntries(
        Object.entries(calculations).map(([key,value]) => [key, formatMoney(value)])
    )
}

function withCalculations(bordro){
    const calculations = calculateBordro(bordro)
    return {
        ...bordro,
        calculations,
        formattedCalculations: formatCalculations(calculations)
    }
}

const validatePersonel = [
    body("name").trim().notEmpty().withMessage("Lütfen personel adı giriniz."),
    body("tckn").trim().optional({checkFalsy:true}),
    body("role").trim().optional({checkFalsy:true}),
    body("official_gross_salary").isNumeric().withMessage("Resmi brüt maaş sayı olmalıdır."),
    body("agreed_total_salary").isNumeric().withMessage("Anlaşılan toplam maaş sayı olmalıdır.")
]

const validateBordro = [
    body("personel_id").notEmpty().withMessage("Lütfen personel seçiniz."),
    body("payroll_month").trim().notEmpty().withMessage("Lütfen bordro ayı seçiniz."),
    body("official_gross_salary").isNumeric().withMessage("Resmi brüt maaş sayı olmalıdır."),
    body("agreed_total_salary").isNumeric().withMessage("Anlaşılan toplam maaş sayı olmalıdır."),
    body("working_days").isNumeric().withMessage("Çalışma günü sayı olmalıdır."),
    body("overtime_days").isNumeric().withMessage("Mesai günü sayı olmalıdır."),
    body("overtime_hours").isNumeric().withMessage("Mesai saati sayı olmalıdır."),
    body("advance_payment").isNumeric().withMessage("Avans sayı olmalıdır."),
    body("icra_deduction").isNumeric().withMessage("İcra kesintisi sayı olmalıdır."),
    body("prior_cumulative_tax_base").isNumeric().withMessage("Önceki kümülatif matrah sayı olmalıdır."),
    body("payment_type").trim().notEmpty().withMessage("Lütfen ödeme tipi seçiniz."),
    body("notes").trim().optional({checkFalsy:true})
]

async function getPersonelList(req,res){
    const personelList = await db.getAllPersonel()
    return res.render("personelList",{personelList})
}

async function getPersonelForm(req,res){
    return res.render("personelForm",{personel:null})
}

const createPersonel = [...validatePersonel, async (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.send({error: errors.array()})

    const {name,tckn,role,official_gross_salary,agreed_total_salary} = matchedData(req)
    await db.createPersonel(name,tckn || "",role || "",official_gross_salary,agreed_total_salary)
    return res.redirect("/personel")
}]

async function getPersonelEditForm(req,res){
    const {id} = req.params
    const personel = await db.getOnePersonel(id)
    if(!personel) return res.status(404).send({error:"Personel bulunmadı."})
    return res.render("personelForm",{personel})
}

const updatePersonel = [...validatePersonel, async (req,res) => {
    const {id} = req.params
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.send({error: errors.array()})

    const {name,tckn,role,official_gross_salary,agreed_total_salary} = matchedData(req)
    await db.updatePersonel(id,name,tckn || "",role || "",official_gross_salary,agreed_total_salary)
    return res.redirect("/personel")
}]

async function deletePersonel(req,res){
    const {id} = req.params
    await db.deletePersonel(id)
    return res.redirect("/personel")
}

async function getBordroList(req,res){
    const defaultMonth = new Date().toISOString().slice(0,7)
    const month = req.query.month || defaultMonth
    const bordroList = (await db.getBordroList(month)).map(withCalculations)
    return res.render("bordroList",{bordroList, month, defaultMonth})
}

async function getBordroForm(req,res){
    const {personelId} = req.query
    const personelList = await db.getAllPersonel()
    const selectedPersonel = personelId ? await db.getOnePersonel(personelId) : personelList[0]
    return res.render("bordroForm",{bordro:null, personelList, selectedPersonel, rates: PAYROLL_RATES_2026})
}

const createBordro = [...validateBordro, async (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.send({error: errors.array()})

    const {personel_id,payroll_month,official_gross_salary,agreed_total_salary,working_days,overtime_days,overtime_hours,advance_payment,icra_deduction,prior_cumulative_tax_base,payment_type,notes} = matchedData(req)
    const calculations = calculateBordro({official_gross_salary,agreed_total_salary,working_days,overtime_days,overtime_hours,advance_payment,icra_deduction,prior_cumulative_tax_base})
    await db.createBordro(personel_id,payroll_month,official_gross_salary,calculations.officialNetSalary,agreed_total_salary,calculations.salaryExtraAmount,working_days,overtime_days,overtime_hours,advance_payment,icra_deduction,prior_cumulative_tax_base,payment_type,notes || "")
    return res.redirect(`/bordro?month=${payroll_month}`)
}]

async function getBordroEditForm(req,res){
    const {id} = req.params
    const bordro = await db.getOneBordro(id)
    if(!bordro) return res.status(404).send({error:"Bordro bulunmadı."})
    const personelList = await db.getAllPersonel()
    return res.render("bordroForm",{bordro, personelList, selectedPersonel:null, rates: PAYROLL_RATES_2026})
}

const updateBordro = [...validateBordro, async (req,res) => {
    const {id} = req.params
    const errors = validationResult(req)
    if(!errors.isEmpty()) return res.send({error: errors.array()})

    const {payroll_month,official_gross_salary,agreed_total_salary,working_days,overtime_days,overtime_hours,advance_payment,icra_deduction,prior_cumulative_tax_base,payment_type,notes} = matchedData(req)
    const calculations = calculateBordro({official_gross_salary,agreed_total_salary,working_days,overtime_days,overtime_hours,advance_payment,icra_deduction,prior_cumulative_tax_base})
    await db.updateBordro(id,payroll_month,official_gross_salary,calculations.officialNetSalary,agreed_total_salary,calculations.salaryExtraAmount,working_days,overtime_days,overtime_hours,advance_payment,icra_deduction,prior_cumulative_tax_base,payment_type,notes || "")
    return res.redirect(`/bordro?month=${payroll_month}`)
}]

async function getBordroDetail(req,res){
    const {id} = req.params
    const bordro = await db.getOneBordro(id)
    if(!bordro) return res.status(404).send({error:"Bordro bulunmadı."})
    const calculations = calculateBordro(bordro)
    return res.render("bordroDetail",{bordro, calculations, formattedCalculations: formatCalculations(calculations), rates: PAYROLL_RATES_2026, autoPrint: req.query.print === "1"})
}

async function getBordroBulkPrint(req,res){
    const {month} = req.query
    if(!month) return res.redirect("/bordro")
    const bordroList = (await db.getBordroList(month)).map(withCalculations)

    return res.render("bordroBulkPrint",{bordroList, month, autoPrint: req.query.print === "1"})
}

async function updateMinimumPaid(req,res){
    const {id} = req.params
    await db.updateBordroMinimumPaid(id,parseBooleanField(req.body.minimum_wage_paid))
    return res.redirect(req.get("Referrer") || "/bordro")
}

async function updateExtraSent(req,res){
    const {id} = req.params
    await db.updateBordroExtraSent(id,parseBooleanField(req.body.salary_extra_sent))
    return res.redirect(req.get("Referrer") || "/bordro")
}

async function deleteBordro(req,res){
    const {id} = req.params
    const bordro = await db.getOneBordro(id)
    await db.deleteBordro(id)
    return res.redirect(bordro ? `/bordro?month=${bordro.payroll_month}` : "/bordro")
}

export default {getPersonelList, getPersonelForm, createPersonel, getPersonelEditForm, updatePersonel, deletePersonel, getBordroList, getBordroForm, createBordro, getBordroEditForm, updateBordro, getBordroDetail, getBordroBulkPrint, updateMinimumPaid, updateExtraSent, deleteBordro}
