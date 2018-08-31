var pdf = require('pdfkit')
var fs = require('file-system')
var moment = require('moment')
moment.locale('sv')

class pdfcreator {
  constructor(expenses, date) {
    this.myDoc = new pdf
    this.expenses = expenses
    this.date = date
    this.generatePages = this.generatePages.bind(this)
    this.setupPdf = this.setupPdf.bind(this)
    this.addUserExpenses = this.addUserExpenses.bind(this)
  }

  setupPdf(userName, expenses, noOfPages, currPage) {

    var cars = {
      comp_diesl: 0,
      comp_gas: 0,
      own: 0
    }
    let dividedByCarType = {
      own: [],
      gas: [],
      diesel: []
    }
   
    expenses.forEach(function(expense){
      // console.log('car_type:', expense.car_type)
      // console.log('cars:', cars)
      switch(expense.car_type) {
        case 'Företagsbil diesel':
          // console.log('träff1')
          cars.comp_diesl = 1
          dividedByCarType.diesel.push(expense)
          break
        case 'Företagsbil bensin':
          //  console.log('träff2')
          cars.comp_gas = 1
          dividedByCarType.gas.push(expense)
          break
        case 'Egen bil':
          // console.log('träff3')        
          cars.own = 1
          dividedByCarType.own.push(expense)
          break
      } 
    })

    let myDoc = this.myDoc
    myDoc.font('Times-Roman').fontSize(12).text(`${currPage}(${noOfPages})`, 520, 20)
    myDoc.font('Times-Roman').fontSize(12).text(`Namn:   ${userName}`, 160, 50)
    myDoc.moveTo(197, 60).lineTo(397,60).stroke()
    myDoc.font('Times-Roman').fontSize(12).text(`Månad:   ${moment.monthsShort(this.date.month-1)}-${this.date.year}`, 160, 70)
    myDoc.moveTo(197, 80).lineTo(397,80).stroke()
    myDoc.font('Times-Roman').fontSize(12).text('Markera om du har egen bil eller tjänstebil. Bensin eller diesel.', 130, 100)
    myDoc.font('Times-Roman').fontSize(12).text('Egen bil i tjänsten', 130, 120)
    myDoc.font('Times-Roman').fontSize(12).text('1,85 kr', 457, 120)
    myDoc.rect(510, 120, 10, 10).stroke()
    if (cars.own) { 
      myDoc.moveTo(510, 120).lineTo(520, 130).stroke() 
      myDoc.moveTo(510, 130).lineTo(520, 120).stroke() 
    } 
    myDoc.font('Times-Roman').fontSize(12).text('Tjänstebil Bensin', 130, 140)
    myDoc.font('Times-Roman').fontSize(12).text('0,95 kr', 457, 140)
    myDoc.rect(510, 140, 10, 10).stroke()
    if (cars.comp_gas) { 
      myDoc.moveTo(510, 140).lineTo(520, 150).stroke() 
      myDoc.moveTo(510, 150).lineTo(520, 140).stroke() 
    } 
    myDoc.font('Times-Roman').fontSize(12).text('Tjänstebil Diesel', 130, 160)
    myDoc.font('Times-Roman').fontSize(12).text('0,65 kr', 457, 160)
    myDoc.rect(510, 160, 10, 10).stroke()
    if (cars.comp_diesl) { 
      myDoc.moveTo(510, 160).lineTo(520, 170).stroke() 
      myDoc.moveTo(510, 170).lineTo(520, 160).stroke() 
    } 
    myDoc.font('Times-Roman').fontSize(12).text('Datum', 130, 200)
    myDoc.font('Times-Roman').fontSize(12).text('Färdväg', 220, 200)
    myDoc.font('Times-Roman').fontSize(12).text('Antal kilometer', 440, 200)
    myDoc.moveTo(120, 220).lineTo(530, 220).stroke()

    return dividedByCarType
  }

  addUserExpenses(expenses) {
    let myDoc = this.myDoc
    let verticalOffset = 0
    let cost = {
      gas: 0,
      diesel: 0,
      own: 0
    }
    let milageCost = {
      gas: 0.95,
      diesel: 0.65,
      own: 1.85
    }
    
    let totalCost = 0

    // OWN CAR EXPENSES
    expenses.own.forEach( function(elem) {
      let vo = verticalOffset
      cost.own = cost.own + parseInt(elem.km)      
      myDoc.moveTo(120, 220 + vo).lineTo(120, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${moment(elem.date).subtract(1,'days').format('L')}`, 140, 223 + vo)
      myDoc.moveTo(220, 220 + vo).lineTo(220, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${elem.route_descr}`, 240, 223 + vo)
      myDoc.moveTo(440, 220 + vo).lineTo(440, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${elem.km}`, 460, 223 + vo)
      myDoc.moveTo(530, 220 + vo).lineTo(530, 235 + vo).stroke()
      myDoc.moveTo(120, 220 + vo).lineTo(530, 220 + vo).stroke()
      verticalOffset = verticalOffset + 15
    })
    totalCost = totalCost + cost.own

    if(expenses.own.length > 0) {
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(120, 235 + verticalOffset).stroke()
      myDoc.moveTo(220, 220 + verticalOffset).lineTo(220, 235 + verticalOffset).stroke()
      myDoc.font('Times-Roman').fontSize(12).text('Summa Privat Bil', 240, 223 + verticalOffset)
      myDoc.moveTo(440, 220 + verticalOffset).lineTo(440, 235 + verticalOffset).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${cost.own}`, 460, 223 + verticalOffset)
      myDoc.moveTo(530, 220 + verticalOffset).lineTo(530, 235 + verticalOffset).stroke()
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
      verticalOffset = verticalOffset + 15
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
    }
    // SUMMA TJÄNSTEBIL DIESEL

    expenses.diesel.forEach( function(elem) {
      let vo = verticalOffset
      cost.diesel = cost.diesel + parseInt(elem.km)      
      myDoc.moveTo(120, 220 + vo).lineTo(120, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${moment(elem.date).subtract(1,'days').format('L')}`, 140, 223 + vo)
      myDoc.moveTo(220, 220 + vo).lineTo(220, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${elem.route_descr}`, 240, 223 + vo)
      myDoc.moveTo(440, 220 + vo).lineTo(440, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${elem.km}`, 460, 223 + vo)
      myDoc.moveTo(530, 220 + vo).lineTo(530, 235 + vo).stroke()
      myDoc.moveTo(120, 220 + vo).lineTo(530, 220 + vo).stroke()
      verticalOffset = verticalOffset + 15
    })
    totalCost = totalCost + cost.diesel
    //myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
    //verticalOffset = verticalOffset + 15
    if(expenses.diesel.length > 0) {
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(120, 235 + verticalOffset).stroke()
      myDoc.moveTo(220, 220 + verticalOffset).lineTo(220, 235 + verticalOffset).stroke()
      myDoc.font('Times-Roman').fontSize(12).text('Summa  Tjänstebil diesel', 240, 223 + verticalOffset)
      myDoc.moveTo(440, 220 + verticalOffset).lineTo(440, 235 + verticalOffset).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${cost.diesel}`, 460, 223 + verticalOffset)
      myDoc.moveTo(530, 220 + verticalOffset).lineTo(530, 235 + verticalOffset).stroke()
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
      verticalOffset = verticalOffset + 15
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
    }
    // SUMMA TJÄNSTEBIL BENSIN

    expenses.gas.forEach( function(elem) {
      let vo = verticalOffset
      cost.gas = cost.gas + parseInt(elem.km)      
      myDoc.moveTo(120, 220 + vo).lineTo(120, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${moment(elem.date).subtract(1,'days').format('L')}`, 140, 223 + vo)
      myDoc.moveTo(220, 220 + vo).lineTo(220, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${elem.route_descr}`, 240, 223 + vo)
      myDoc.moveTo(440, 220 + vo).lineTo(440, 235 + vo).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${elem.km}`, 460, 223 + vo)
      myDoc.moveTo(530, 220 + vo).lineTo(530, 235 + vo).stroke()
      myDoc.moveTo(120, 220 + vo).lineTo(530, 220 + vo).stroke()
      verticalOffset = verticalOffset + 15
    })
    totalCost = totalCost + cost.gas
    //myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
    //verticalOffset = verticalOffset + 15
    if(expenses.gas.length > 0) {
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(120, 235 + verticalOffset).stroke()
      myDoc.moveTo(220, 220 + verticalOffset).lineTo(220, 235 + verticalOffset).stroke()
      myDoc.font('Times-Roman').fontSize(12).text('Summa Tjänstebil bensin', 240, 223 + verticalOffset)
      myDoc.moveTo(440, 220 + verticalOffset).lineTo(440, 235 + verticalOffset).stroke()
      myDoc.font('Times-Roman').fontSize(12).text(`${cost.gas}`, 460, 223 + verticalOffset)
      myDoc.moveTo(530, 220 + verticalOffset).lineTo(530, 235 + verticalOffset).stroke()
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
      verticalOffset = verticalOffset + 15
      myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
    }

    myDoc.font('Times-Roman').fontSize(12).text('Total körda kilometer:', 240, 223 + verticalOffset)
    myDoc.moveTo(440, 220 + verticalOffset).lineTo(440, 235 + verticalOffset).stroke()
    myDoc.font('Times-Roman').fontSize(12).text(`${totalCost}`, 460, 223 + verticalOffset)
    myDoc.moveTo(530, 220 + verticalOffset).lineTo(530, 235 + verticalOffset).stroke()
    verticalOffset = verticalOffset + 15
    myDoc.moveTo(440, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
    verticalOffset = verticalOffset + 30

    myDoc.font('Times-Roman').fontSize(12).text('Attesteras:', 160, 210 + verticalOffset)    
    myDoc.moveTo(220, 220 + verticalOffset).lineTo(440, 220 + verticalOffset).stroke()


    verticalOffset = verticalOffset + 30
    myDoc.font('Times-Roman').fontSize(12).text('Egen bil i tjänsten', 240, 223 + verticalOffset)
    myDoc.font('Times-Roman').fontSize(12).text(`${(cost.own * milageCost.own) < 1 ? '-' :  Math.round(cost.own * milageCost.own)} kr`, 460, 223 + verticalOffset)
    verticalOffset = verticalOffset + 15
    myDoc.font('Times-Roman').fontSize(12).text('Egen bil i tjänsten', 240, 223 + verticalOffset)
    myDoc.font('Times-Roman').fontSize(12).text(`${(cost.gas * milageCost.gas) < 1 ? '-' :  Math.round(cost.gas * milageCost.gas)} kr`, 460, 223 + verticalOffset)
    verticalOffset = verticalOffset + 15
    myDoc.font('Times-Roman').fontSize(12).text('Tjänstebil Diesel', 240, 223 + verticalOffset)
    myDoc.font('Times-Roman').fontSize(12).text(`${(cost.diesel * milageCost.diesel) < 1 ? '-' : Math.round(cost.diesel * milageCost.diesel)} kr`, 460, 223 + verticalOffset)
    verticalOffset = verticalOffset + 15
    myDoc.font('Times-Roman').fontSize(12).text('Summa', 240, 223 + verticalOffset)
    myDoc.font('Times-Roman').fontSize(12).text(`${totalCost} kr`, 460, 223 + verticalOffset)
    verticalOffset = verticalOffset + 50

    myDoc.font('Times-Roman').fontSize(12).text('Faktureras kund:', 130, 210 + verticalOffset)
    myDoc.moveTo(220, 220 + verticalOffset).lineTo(440, 220 + verticalOffset).stroke()



  }

  generatePages () {
    let first = true
    let myDoc = this.myDoc
    let date = this.date
    let addUserExpenses = this.addUserExpenses
    let setupPdf = this.setupPdf
    let expensesDividedByCar
    let noOfPages = this.expenses.length
    let currPage = 1
    this.expenses.forEach(function(user) {
      if (first) {
        myDoc.pipe(fs.createWriteStream(`${date.month}-${date.year}.pdf`))
        myDoc.font('Times-Roman').fontSize(14).text('Milersättning', 230, 20)
        expensesDividedByCar = setupPdf(user.user, user.expenses, noOfPages, currPage)
        addUserExpenses(expensesDividedByCar)
        first = false
      } else {
        myDoc.addPage()
        expensesDividedByCar = setupPdf(user.user, user.expenses, noOfPages, currPage)
        console.log('expensesDividedByCar:', expensesDividedByCar)
        addUserExpenses(expensesDividedByCar)
      }
      currPage = currPage + 1
    })
    myDoc.moveTo(0, 0)
    myDoc.end()
  }
}

module.exports.pdfcreator = pdfcreator

// setup(user_list) -> create a page (=> 1) , including generate user_expenses 
// 
