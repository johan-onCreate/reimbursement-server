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

  setupPdf(userName, expenses) {

    let cars = {
      comp_diesl: 0,
      comp_gas: 0,
      own: 0
    }
    expenses.forEach(function(expense){
      switch(expense.car_type) {
        case 'Företagsbil diesel':
          cars.comp_diesl = 1
        case 'Företagsbil bensin':
          cars.comp_gas = 1
        case 'Egen bil':
          cars.own = 1
      } 
    })

    let myDoc = this.myDoc
    myDoc.font('Times-Roman').fontSize(12).text(`Namn:   ${userName}`, 160, 50)
    myDoc.moveTo(197, 60).lineTo(397,60).stroke()
    myDoc.font('Times-Roman').fontSize(12).text(`Månad:   ${moment.monthsShort(this.date.month)}-${this.date.year}`, 160, 70)
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
  }

  addUserExpenses(expenses) {
    let myDoc = this.myDoc
    let verticalOffset = 0
    expenses.forEach( function(elem) {
      let vo = verticalOffset
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
    myDoc.moveTo(120, 220 + verticalOffset).lineTo(530, 220 + verticalOffset).stroke()
  }

  generatePages () {
    let first = true
    let myDoc = this.myDoc
    let date = this.date
    let addUserExpenses = this.addUserExpenses
    let setupPdf = this.setupPdf
    this.expenses.forEach(function(user) {
      if (first) {
        myDoc.pipe(fs.createWriteStream(`${date.month}-${date.year}.pdf`))
        setupPdf(user.user, user.expenses)
        addUserExpenses(user.expenses)
        first = false
      } else {
        myDoc.addPage()
        setupPdf(user.user, user.expenses)
        addUserExpenses(user.expenses)
      }
    })
    myDoc.moveTo(0, 0)
    myDoc.end()
  }
}

module.exports.pdfcreator = pdfcreator

// setup(user_list) -> create a page (=> 1) , including generate user_expenses 
// 
