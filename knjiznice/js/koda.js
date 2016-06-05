
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var EHRID;

$( document ).ready(function() {
    for(i in osnovni)
        init(osnovni[i]);
    //deleteMe();
    //generiraj();
});

function init(oseba) {
    $.ajaxSetup({
        headers: {
            "Ehr-Session": getSessionId()
        }
    });
    var searchData = [
        {key: "ehrId", value: oseba.ehrId}
    ];
    $.ajax({
        url: baseUrl + "/demographics/party/query",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(searchData),
        success: function (res) {
            $("#collapse2").append("<p class=\"pacient\" id=\"ehrID\" onclick=\"prikazi(\'"+ oseba.ehrId+ "\')\">"+oseba.firstName+" "+oseba.lastName+"</p>");
        }
    });
}
/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
var osnovni = [
                {   
                    'ehrId': '1e70cd10-866e-4e43-b729-79a449951f85',
                    'sex': 'MALE',
                    'firstName': 'Rok',
                    'lastName': 'Kanduti',
                    'dateOfBirth': '1996-3-08T08:12',
                    'state': 'healthy',
                    'osn': {
                        'teza': 18.4,
                        'visina': 109.2
                    }
                },
                {   
                    'ehrId': '0e2b15d3-e24a-4cfd-a290-a7a0ee0758aa',
                    'sex': 'MALE',
                    'firstName': 'Bridger',
                    'lastName': 'Philips',
                    'dateOfBirth': '1995-6-01T14:33',
                    'state': 'obese',
                    'osn': {
                        'teza': 29.5,
                        'visina': 104.2
                    }
                }
            ]
 
function addAuth() {
    $.ajaxSetup({
		    headers: {"Ehr-Session": getSessionId()}
	});
}

function generirajVitalne(ehrId, state, pod) {
    console.log(ehrId);
    if(state == 'healthy') {
        var date = new Date(2000, 01, 01, 14, 30, 00, 00);
        
        for(var i = 0; i < 30; i++) {
            var podatki = {};
            pod.osn.teza = (parseFloat(pod.osn.teza) + ((Math.random() * 4))).toFixed(1);
            pod.osn.visina = (parseFloat(pod.osn.visina) + ((Math.random() * 5))).toFixed(1);
            
            podatki['visina'] = pod.osn.visina;
            podatki['teza'] = pod.osn.teza;
            podatki['temperatura'] = ((Math.random() * 11  | 0) / 10 + 36.5).toFixed(1);
			podatki["kisik"] = ((Math.random() * 10 | 0) + 90);
			podatki["sistolicni"] = (Math.random() * 30 | 0) + 90;
			podatki["diastolicni"] = (Math.random() * 20 | 0) + 60;
			podatki["pulz"] = (Math.random() * 10 | 0) + 70;
			podatki["datum"] = date.toISOString();
			
			vstaviVBazo(podatki, ehrId);
			
			date = spremeniDatum(date, 180);
        }
    }
    else if(state == 'obese') {
        var visina = 155;
        var date = new Date(2000, 03, 05, 12, 45, 00, 00);
        
        for(var i = 0; i < 30; i++) {
            var podatki = {};
            pod.osn.teza = (parseFloat(pod.osn.teza) + ((Math.random() * 8))).toFixed(1);
            pod.osn.visina = (parseFloat(pod.osn.visina) + ((Math.random() * 5))).toFixed(1);
            
            podatki['visina'] = pod.osn.visina;
            podatki['teza'] = pod.osn.teza;
            podatki['temperatura'] = ((Math.random() * 11  | 0) / 10 + 36.5).toFixed(1);
			podatki["kisik"] = ((Math.random() * 10 | 0) + 85);
			podatki["sistolicni"] = (Math.random() * 30 | 0) + 140;
			podatki["diastolicni"] = (Math.random() * 10 | 0) + 95;
			podatki["pulz"] = (Math.random() * 10 | 0) + 95;
			podatki["datum"] = date.toISOString();
			
			vstaviVBazo(podatki, ehrId);
			
			date = spremeniDatum(date, 180);
        }
    }
}

function vstaviVBazo(podatki, ehrId) {
    $.ajaxSetup({
        headers: {
            "Ehr-Session": getSessionId()
        }
    });
    var compositionData = {
        "ctx/time": podatki['datum'],
        "ctx/language": "en",
        "ctx/territory": "SI",
        "vital_signs/body_temperature/any_event/temperature|magnitude": podatki['temperatura'],
        "vital_signs/body_temperature/any_event/temperature|unit": "°C",
        "vital_signs/blood_pressure/any_event/systolic": podatki['sistolicni'],
        "vital_signs/blood_pressure/any_event/diastolic": podatki['diastolicni'],
        "vital_signs/height_length/any_event/body_height_length": podatki['visina'],
        "vital_signs/body_weight/any_event/body_weight": podatki['teza'],
	    "vital_signs/indirect_oximetry:0/spo2|numerator": podatki["kisik"],
	    "vital_signs/pulse/any_event/rate": podatki["pulz"]
    };
    var queryParams = {
        "ehrId": ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT',
        committer: 'rokk'
    };
    $.ajax({
        url: baseUrl + "/composition?" + $.param(queryParams),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(compositionData),
        success: function (res) {
            $("#header").html("Store composition");
            $("#result").html(res.meta.href);
        }
    });
}

function spremeniDatum(date, dnevi) {
    var temp = new Date(date);
    temp.setDate(temp.getDate() + dnevi);
    return temp;
}

function generiraj() {
    //$("#collapse2").empty();
    for(i in osnovni) 
        generirajPodatke(i);
    
}

function generirajPodatke(i) {
    var temp = osnovni[i];
    generirajPod(temp.firstName, temp.lastName, temp.sex, temp.dateOfBirth, temp.state, temp);  
}

function generirajPod(ime, priimek, spol, datum, status, temp) {
  ehrId = "";
  addAuth();
  var response = $.ajax({
                    url: baseUrl + "/ehr",
                    type: 'POST',
                    success: function (data) {
                        var ehrId = data.ehrId;
                        ehrID = ehrId;
                        // build party data
                        var partyData = {
                            firstNames: ime,
                            lastNames: priimek,
                            gender: spol,
                            dateOfBirth: datum,
                            partyAdditionalInfo: [
                                {
                                    key: "ehrId",
                                    value: ehrId
                                }
                            ]
                        };
                        $.ajax({
                            url: baseUrl + "/demographics/party",
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(partyData),
                            success: function (party) {
                                console.log(ehrId);
                                if (party.action == 'CREATE') {
                                    $("#collapse2").append("<p class=\"pacient\" id=\"ehrID\" onclick=\"prikazi(\'"+ ehrId+ "\')\">"+ime+" "+priimek+"</p>");
                                    setTimeout(function() {}, 100);
                                    generirajVitalne(ehrId, status, temp);
                                    prikaziEhr(ehrId);
                                }
                            }
                        });
                    }
                });
    $("#genP").hide();
    $("#izbor").show();
    $("#izbor1").trigger("click");
}
var ime, spl, datR;

function prikaziEhr(ehrId) {
    $('#genIds').append("<p class=\"pacient\" id=\"ehrID\" onclick=\"prikazi(\'"+ ehrId+ "\')\">"+ehrId+"</p>");
    $('#genIds').show();
}

function prikazi(ehrId) {
    console.log(ehrId);
    $("#vsebina").empty();
    
    EHRID = ehrId;
    weight = pressure = temperature = oxygen = height = null;
    $("#ime").empty();
    
    $.ajax({
        url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
        type: 'GET',
        headers: {
            "Authorization": getSessionId()
        },
        success: function (data) {
            var party = data.party;
            $("#ime").append('<span class="glyphicon glyphicon-user"></span> ' + party.firstNames + ' ' + party.lastNames);
            ime = party.firstNames + ' ' + party.lastNames;
            spl = party.gender == 'MALE' ? 'Moški' : 'Ženska';
            datR = formatDatum(party.dateOfBirth);
            EHRID = ehrId;
            prikazPodatki(ime, spl, datR, EHRID);
        }
    });
    $(".prikazPacienta").show();
    
    var ehrId = EHRID;
    weight = podatkiIzBaze(ehrId, 'weight');
    weight = weight.responseJSON;
    height = podatkiIzBaze(ehrId, 'height');
    height = height.responseJSON;
    pressure = podatkiIzBaze(ehrId, 'blood_pressure');
    pressure = pressure.responseJSON;
    temperature = podatkiIzBaze(ehrId, 'body_temperature');
    temperature = temperature.responseJSON;
    oxygen = podatkiIzBaze(ehrId, 'spO2');
    oxygen = oxygen.responseJSON;
    pulse = podatkiIzBaze(ehrId, 'pulse');
    pulse = pulse.responseJSON;
}

function searchByEhdID() {
    var ehrId = $('#inpEhrID').val();
    prikazi(ehrId);
    
}

function podatkiIzBaze(ehrId, podatek) {
    var temp = $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + podatek,
        type: 'GET',
		    data: {
		    	limit: 100
		    },
        headers: {
            "Ehr-Session": getSessionId()
        },
        success: function (res) {
            return res;
        },
        async: false
    });
    return temp;
}

function formatDatumFull(date) {
    date = new Date(date);
    return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes();
    
}

function formatDatum(date) {
    date = new Date(date);
    return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
    
}

var weight, pressure, temperature, oxygen, height, pulse;

function podatkiKisik() {
    $("#vsebina").empty();
    $("#vsebina").append('<div hidden class="col-lg-12" id="osnPod">' +
                        '<div class="row">' +
                        '<div class="col-lg-4 col-lg-offset-1">' +
                        '<h4>Datum pregleda:</h4>' +
                        '</div>' +
                        '<div class="col-lg-4">' +
                        '<select class="form-control" id="podDate" onchange="spremembaPregleda(value);">' +
                        '<option value="1">1</option>' +
                        '<option value="2">2</option>' +
                        '<option value="3">3</option>' +
                        '<option value="4">4</option>' +
                        '</select>' +
                        '</div>' +
                        '</div>' +
                        '<div class="row">' +
                        '<div class="col-lg-12" id="zadKisik" style="position: relative;"></div>' +
                        '</div>' +
                        '</div>');
                         
    $("#podDate").empty();
    $("#podDate").append("<option value='"+-1+"' id='toRemDat'></option>")
    for(i in weight) {
        date = formatDatum(weight[i].time);
        $("#podDate").append("<option value='"+i+"'>"+date+"</option>")
    }
    spremembaPregleda(0);
    $("#osnPod").show();
}

function spremembaPregleda($i){
    $("#toRemDat").remove();
    var i = $i;
    
    
    var visina, sirina;
    setTimeout(function(){
    
    sirina = ($("#zadKisik").width()*0.5).toFixed(0);
    visina = (sirina * 0.56).toFixed(0);
    console.log(sirina + ' visina ' + visina);

    FusionCharts.ready(function(){
        var revenueChart = new FusionCharts({
        type: 'hlineargauge',
        renderAt: 'zadKisik',
        id: 'cs-linear-gauge',
        width: sirina,
        height: sirina*0.3,
        dataFormat: 'json',
        dataSource: {
            "chart": {
                "theme": "fint",
                "caption": "Vsebnost kisika v krvi",
                "lowerLimit": "0",
                "upperLimit": "100",
                "numberSuffix": "%",
                "chartBottomMargin": "20",
                "valueFontSize": "11",
                "valueFontBold": "0",
                "majorTMNumber": "10",
                "minorTMNumber": "5",
                "adjustTM": "1",
                "gaugeFillMix": "{light}"
            },
            "colorRange": {
                "color": [
                    {
                        "minValue": "00",
                        "maxValue": "90",
                        "label": "Kritično",
                        "code": "#9C3549"
                    }, 
                    {
                        "minValue": "90",
                        "maxValue": "100",
                        "label": "Normalno",
                        "code": "#526400"
                    }
                ]
            },
            "pointers": {
                "pointer": [
                    {
                        "value": oxygen[i].spO2
                    }
                ]
            }
        }
    });
    revenueChart.render();
    
    })}, 100);
}

function prikazVisTez() {
    $("#vsebina").empty();
    $("#vsebina").append('<div hidden class="col-lg-12" id="podVisTez" style="position: relative;"></div>');
    
    setTimeout(function(){
        var sirina = ($("#podVisTez").width()*0.8).toFixed(0);
        var visina = (sirina * 0.56).toFixed(0);
        var j = 0;
        var categories = {"categories": [{"category": []}]};
        var dataset = {"dataset": [{"seriesName": "Višina","data": []}, {"seriesName": "Teža","parentYAxis": "S","renderAs": "line","data": []}]};
        console.log();
        for(i = height.length-1; i >= 0; i--) {
            categories.categories[0].category[j] = {"label": formatDatum(height[i].time)};
            dataset.dataset[0].data[j] = {"value": height[i].height};
            dataset.dataset[1].data[j] = {"value": weight[i].weight};
            j++;
        }
    
    FusionCharts.ready(function(){
        var revenueChart = new FusionCharts({
            "type": "scrollcombidy2d",
            "renderAt": "podVisTez",
            "width": sirina,
            "height": visina,
            "dataFormat": "json",
            "dataSource":  {
              "chart": {
                "caption": "Višina in teža",
                "subCaption": "",
                "xAxisname": "Pregled",
                "pYAxisName": "Višina",
                "sYAxisName": "Teža",
                "numberSuffix": " cm",
                "sNumberSuffix" : " kg",
                "theme": "fint",
                "showValues": "0",
                "syncAxisLimits": "1",
                "labelStep": "3",
                
                "paletteColors" : "#2f797d,#d97b9c",
                "baseFontColor" : "#333333",
                "baseFont" : "Helvetica Neue,Arial",
                "captionFontSize" : "14",
                "subcaptionFontSize" : "14",
                "subcaptionFontBold" : "0",
                "showBorder" : "0",
                "bgColor" : "#ffffff",
                "showShadow" : "0",
                "canvasBgColor" : "#ffffff",
                "canvasBorderAlpha" : "0",
                "divlineAlpha" : "100",
                "divlineColor" : "#999999",
                "divlineThickness" : "1",
                "divLineIsDashed" : "1",
                "divLineDashLen" : "1",
                "divLineGapLen" : "1",
                "usePlotGradientColor" : "0",
                "showplotborder" : "0",
                "showXAxisLine" : "1",
                "xAxisLineThickness" : "1",
                "xAxisLineColor" : "#999999",
                "showAlternateHGridColor" : "0",
                "showAlternateVGridColor" : "0",
                "legendBgAlpha" : "0",
                "legendBorderAlpha" : "0",
                "legendShadow" : "0",
                "legendItemFontSize" : "10",
                "legendItemFontColor" : "#666666"
             },
             "categories" : categories.categories,
             "dataset": dataset.dataset
          }
    
      });
    revenueChart.render();
    })}, 100);
    
    $("#podVisTez").show();
}

function podatkiITM() {
    $("#vsebina").empty();
    $("#vsebina").append('<div hidden class="col-lg-12" id="podITM" style="margin-left: 5%;"></div>');

    setTimeout(function(){
        var sirina = ($("#podITM").width()*0.8).toFixed(0);
        var visina = (sirina * 0.56).toFixed(0);
        var j = 0;
        var data = {"data": []};
        for(i = height.length-1; i >= 0; i--) {
            datum = formatDatum(height[i].time);
            itm = (parseFloat(weight[i].weight) / Math.pow(parseFloat(height[i].height)/100, 2)).toFixed(1);
            barva = "#869f1f";
            console.log(itm);
            if(itm < 20)
                barva = "#c17b9d";
            else if(itm > 30)
                barva = "#b2164e";
                
            data.data[j] = {"label": datum, "value": itm};//, "color": barva};
            j++;
        }
    
    FusionCharts.ready(function(){
        var revenueChart = new FusionCharts({
            "type": "line",
            "renderAt": "podITM",
            "width": sirina,
            "height": visina,
            "dataFormat": "json",
            "dataSource":  {
              "chart": {
                "caption": "ITM",
                 "chartLeftMargin": "0",
                "subCaption": "",
                "xAxisName": "Pregled",
                "yAxisName": "ITM",
                "numberPrefix": "",
                "yAxisMinValue": "10",
                "yAxisMaxValue": "50",
                "theme": "fint"
             },
            "data": data.data,
            "trendlines": [
                    {
                        "line": [
                            {
                                "isTrendZone": "1",
                                "startvalue": "10",
                                "endValue": "19.9",
                                "color": "#c17b9d",
                                "alpha": "60",
                                "valueOnRight": "1",
                                "displayvalue": "Podrhanjenost"
                            },
                            {
                                "isTrendZone": "1",
                                "startvalue": "20",
                                "endValue": "30",
                                "color": "#869f1f",
                                "alpha": "60",
                                "valueOnRight": "1",
                                "displayvalue": "Normalno"
                            },
                            {
                                "isTrendZone": "1",
                                "startvalue": "30.1",
                                "endValue": "50",
                                "color": "#b2164e",
                                "alpha": "60",
                                "valueOnRight": "1",
                                "displayvalue": "Debelost"
                            }
                        ]
                    }
                ]
          }
    
      });
    revenueChart.render();
    })}, 100);
    
    $("#podITM").show();
}

function podatkiPulz() {
    $("#vsebina").empty();
    $("#vsebina").append('<div hidden class="col-lg-12" id="podPulz"></div>');
    setTimeout(function(){
        var sirina = ($("#podPulz").width()*0.8).toFixed(0);
        var visina = (sirina * 0.56).toFixed(0);
        var min = 200;
        var max = 0;
        var j = 0;
        var data = {"data": []};
        for(i = height.length-1; i >= 0; i--) {
            datum = formatDatum(height[i].time);
            pulz = pulse[i].pulse;
            
            if(pulz > max)
                max = pulz;
            if(pulz < min)
                min = pulz;
                
            data.data[j] = {"label": datum, "value": pulz};//, "color": barva};
            j++;
        }
    
    FusionCharts.ready(function(){
        var revenueChart = new FusionCharts({
            "type": "line",
            "renderAt": "podPulz",
            "width": sirina,
            "height": visina,
            "dataFormat": "json",
            "dataSource":  {
              "chart": {
                "caption": "Pulse",
                "subCaption": "",
                "xAxisName": "Pregled",
                "yAxisName": "Pulse",
                "numberPrefix": "",
                "yAxisMinValue": min-5,
                "yAxisMaxValue": max+5,
                "theme": "fint"
             },
            "data": data.data
          }
    
      });
    revenueChart.render();
    })}, 100);
    
    $("#podPulz").show();
}

function prikazTlak() {
    $("#vsebina").empty();
    $("#vsebina").append('<div hidden class="col-lg-12" id="podTlak" style="position: relative;"></div>');

    setTimeout(function(){
        var sirina = ($("#podTlak").width()*0.8).toFixed(0);
        var visina = (sirina * 0.56).toFixed(0);
        var j = 0;
        var categories = {"categories": [{"category": []}]};
        var dataset = {"dataset": [{"seriesName": "Sistolični","data": []}, {"seriesName": "Diastolični ","parentYAxis": "S","renderAs": "line","data": []}]};
        console.log();
        var min = 200;
        var max = 0;
        for(i = height.length-1; i >= 0; i--) {
            categories.categories[0].category[j] = {"label": formatDatum(height[i].time)};
            dataset.dataset[0].data[j] = {"value": pressure[i].systolic};
            dataset.dataset[1].data[j] = {"value": pressure[i].diastolic};
            
            if(pressure[i].systolic > max)
                max = pressure[i].systolic;
            if(pressure[i].diastolic < min)
                min = pressure[i].diastolic;
                
            j++;
        }
    
    FusionCharts.ready(function(){
        var revenueChart = new FusionCharts({
            "type": "msline",
            "renderAt": "podTlak",
            "width": sirina,
            "height": visina,
            "dataFormat": "json",
            "dataSource":  {
              "chart": {
                "caption": "Tlak",
                "subCaption": "",
                "xAxisname": "Pregled",
                "YAxisName": "Višina",
                "yAxisMinValue": 165,
                "yAxisMaxValue": 55,
                "numberSuffix": "",
                "theme": "fint",
                
             },
             "categories" : categories.categories,
             "dataset": dataset.dataset
          }
    
      });
    revenueChart.render();
    })}, 100);
    
    $("#podTlak").show();
}

function prikazP() {
    prikazPodatki(ime, spl, datR, EHRID);
}

function prikazPodatki(ime, datum, spol, ehr) {
    $("#vsebina").empty();
    $("#vsebina").append('<div hidden class="col-lg-12" id="osnPod"><div class="row"><div class="col-lg-4 col-lg-offset-1 podNap"><h4>Ime:</h4>' +
                         '</div><div class="col-lg-4 podPod" id="osnIme"></div></div><div class="row"><div class="col-lg-4 col-lg-offset-1 podNap">' +
                         '<h4>Datum rojstva:</h4></div><div class="col-lg-4 podPod" id="osnDat"></div></div><div class="row">' +
                         '<div class="col-lg-4 col-lg-offset-1 podNap"><h4>Spol:</h4></div><div class="col-lg-4 podPod" id="osnSpol">' +
                         '</div></div><div class="row"><div class="col-lg-4 col-lg-offset-1 podNap"><h4>ehrID:</h4></div>' +
                         '<div class="col-lg-4 podPod" id="osnEhr"></div></div></div>');
                         
    $("#osnIme").append('<h4>'+ime+'</h4>');
    $("#osnDat").append('<h4>'+datum+'</h4>');
    $("#osnSpol").append('<h4>'+spol+'</h4>');
    $("#osnEhr").append('<h4>'+ehr+'</h4>');
    $("#osnPod").show();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else { 
        console.log('ne gre');
    }
}

function showPosition(position) {
    console.log("Latitude: " + position.coords.latitude + " long: " + position.coords.longitude);
    var itm = (parseFloat(weight[0].weight) / Math.pow(parseFloat(height[0].height)/100, 2)).toFixed(1);
    if(itm < 20)
        pokaziNaMapi(position.coords.latitude, position.coords.longitude, 'restaurant');
    else if(itm < 40)
        pokaziNaMapi(position.coords.latitude, position.coords.longitude, 'stadium');
    else
        pokaziNaMapi(position.coords.latitude, position.coords.longitude, 'hospital');
}

function showError(error) {
    pokaziNaMapi(null, null);
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}
var map;
var service;
var infowindow;

function pokaziNaMapi(lat, long, tip) {
    if(lat == null)
        lat = parseFloat('46.051454');
    if(long == null)
        long = parseFloat('14.506023');

    $("#vsebina").empty();
    $("#vsebina").append('<div class="col-lg-12" id="podMapPar"></div>');
    var sirina = $("#podMapPar").width()*0.6;
    $("#podMapPar").append('<input type="text" id="lokacija" style="width: '+sirina*0.8+'px;"><div class="col-lg-12" id="podMap" style="height: '+sirina+'px;"></div>');
    
    setTimeout(function() {
        var pyrmont = {lat: lat, lng: long};
        var options = {
                        center: pyrmont,
                        offsetWidth: 0,
                        zoom: 15
                    };
        map = new google.maps.Map(document.getElementById('podMap'), options);
        
        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: pyrmont,
            radius: 5000,
            type: [tip]
        }, callback);
        
        // Create the search box and link it to the UI element.
        var input = document.getElementById('lokacija');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });
        
        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }
            pokaziNaMapi(places[0].geometry.location.lat(), places[0].geometry.location.lng(), tip);
        });
    }, 100);
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}