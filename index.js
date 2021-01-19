const request = require('sync-request');
const fs = require('fs');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '',
        pass: ''
    }
});


async function dajDuzinuUrl(url) {
    let response = request('GET', url);
    return response.getBody().length;
}

function dajLinkoveIzDatoteke() {
    const data = fs.readFileSync('izvjestaji.txt', {encoding:'utf8'}); 
    let izvjestaji = data.toString().split(/\r?\n/);
    let linkovi = [];
    for(let izvjestaj of izvjestaji) {
        let podaci = izvjestaj.split(',');
        linkovi.push(podaci[0]);
    }
    return linkovi;
}

function dajNaslovIPorukuZaUrl(url) {
    const data = fs.readFileSync('izvjestaji.txt', {encoding:'utf8'}); 
    let izvjestaji = data.toString().split(/\r?\n/);
    let naslovIPoruka = {};
    for(let izvjestaj of izvjestaji) {
        let podaci = izvjestaj.split(',');
        if(podaci[0] == url) {
            naslovIPoruka.naslov = podaci[1];
            naslovIPoruka.poruka = podaci[2];
            break;
        }
    }
    return naslovIPoruka;
}

function dajSveMailove() {
    const data = fs.readFileSync('mailovi.txt', {encoding:'utf8'}); 
    let mailovi = data.toString().split(/\r?\n/);
    return mailovi;
}

function posaljiMailSvima(link) {
    console.log("saljem mail za " + link);
    let naslovIPoruka = dajNaslovIPorukuZaUrl(link);
    let mailOptions = {
        from: 'bekani.etf@gmail.com',
        subject: naslovIPoruka.naslov,
        text: naslovIPoruka.poruka
    };
    let mailovi = dajSveMailove();
    for(let mail of mailovi) {
        mailOptions.to = mail;
        transporter.sendMail(mailOptions, function(error, info) {
            if(error) {
                console.log(error);
            } else {
                console.log("Email poslan: " + info.response);
            }
        });
    }
}

async function start() {
    let duzineIzvjestaja = new Map();
    while(true) {
        //dajDuzinuUrl();
        let linkovi = dajLinkoveIzDatoteke();
        for(let link of linkovi) {
            let novaDuzina = await dajDuzinuUrl(link);
            if(duzineIzvjestaja[link] == null) {
                duzineIzvjestaja[link] = novaDuzina;
            } else {
                if(duzineIzvjestaja[link] != novaDuzina) {
                    duzineIzvjestaja[link] = novaDuzina;
                    posaljiMailSvima(link);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

start()