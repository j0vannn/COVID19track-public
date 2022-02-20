var countryList;
var summary;
var ucitanoSummary = false;
var countryData;
var slugGLOBAL = 'serbia';
var ucitanoCountry;
var firstGenerated = false;
var graphReady = false;
var ctx = document.getElementById('myChart');
var requestOptions = {
    method: 'GET',
}

fetchSummary();



var myChart = new Chart(ctx, null
);



function startTool(){
    $("#dobrodosao").hide();
    $("#ucitac").css("display","block");
    setTimeout(function(){
        if(ucitanoSummary == false){
         document.write("Doslo je do greske pri preuzimanju podataka sa servera.")}}, 5000);
    while(true){
        if(ucitanoSummary == false){
            continue;
        }
        else{
            $("#ucitac").hide();
            $("#chartPozadina").css("display","block");
            loadStartInfo();
            break;
        }
    }

}


function loadStartInfo(){
    let list = summary.Countries;
    var dropdown = document.getElementById('countryDropdown');
    for(let i = 0; i<list.length-1;i++){
        dropdown.appendChild(new Option(list[i].Country,list[i].Slug));
    }


    document.getElementById("new").innerHTML = summary.Global.NewConfirmed;
    document.getElementById("deaths").innerHTML = summary.Global.NewDeaths;
    document.getElementById("recovered").innerHTML = summary.Global.NewRecovered;
    count();
}




function fetchSummary(){
   fetch("https://api.covid19api.com/summary").then(response =>{
      if(!response.ok){
          document.write("POSTOJI GRESKAAA");
      }
     return response.json()
  } ).then( data =>{ summary = data; ucitanoSummary = true;})
  
  }

function clickGenerate(){
    if(!firstGenerated){
        $("#counters").css("display","none");
        }
    $("#ucitacChart").css("display","flex", "align-items", "center");
    $("#myChart").css("display","none");

    if(document.getElementById("select1").value == 2){
        fetch("https://corona.lmao.ninja/v2/countries?yesterday&sort").then(response =>{
            if(!response.ok){
                document.write("POSTOJI GRESKAAA");
            }
           return response.json()
        } ).then( data =>{countryData = data; ucitanoCountry = true;checkOptions(2)}
        )
    }
    else{
    let slug = document.getElementById("countryDropdown").value;
    let link = "https://api.covid19api.com/total/dayone/country/" + slug;
    fetch(link).then(response =>{
       if(!response.ok){
           document.write("POSTOJI GRESKAAA");
       }
      return response.json()
   } ).then( data =>{countryData = data; ucitanoCountry = true;checkOptions(1)}
   )
}
   
   }

  $(function () {
    $("#select1").change(function() {
      let val = $(this).val();
      if(val === "1") {
        $("#upitnikZaVreme").css("display","block");
        $("#upitnikZaTOP10").css("display","none");
      }
    });
  });



  $(function () {
    $("#select1").change(function() {
      let val = $(this).val();
      if(val === "2") {
        $("#upitnikZaTOP10").css("display","block");
        $("#upitnikZaVreme").css("display","none");
      }
    });
  });


function checkOptions(select1){
   let line ;
   let deaths = false;
   let confirmed = false;
   let month = false;
   let month6 = false;
    let monthall = false;
    let TOPzarazeni = false;
    let TOPpreminuli = false;
    if(select1 == 1){
        if(document.getElementById("flexCheckChecked").checked){
            deaths = true;
        }
        if(document.getElementById("flexCheckDefault").checked){
            confirmed = true;
        }
    
        if(document.getElementById("radioMonth").checked){
            month = true;
        }
        else if(document.getElementById("radio6Month").checked){
            month6 = true;
        }
        else{
            monthall = true;
        }
        line = true;
    }else{
        line = false;
        if(document.getElementById("TOPzarazeni").checked){
            TOPzarazeni = true;
        }
        if(document.getElementById("TOPpreminuli").checked){
            TOPpreminuli= true;
        }
    }
 generateGraph(line,deaths,confirmed,month,month6,monthall,TOPzarazeni,TOPpreminuli);

}


function generateGraph(line, deaths, confirmed, month, month6, monthall, TOPzarazeni,TOPpreminuli){
    myChart.destroy();
    // sklanja counter
    if(line == true){

        if(month == true){
        myChart = new Chart(ctx,returnLineGraph(deaths,confirmed,30))
        }
        if(month6 == true){
            myChart = new Chart(ctx,returnLineGraph(deaths,confirmed,180))
        }
        if(monthall == true){
            myChart = new Chart(ctx,returnLineGraph(deaths,confirmed,countryData.length))
        }
    }
    else{
       myChart = new Chart(ctx, returnBarGraph(TOPzarazeni, TOPpreminuli));
    }

    $("#ucitacChart").css("display","none");
    $("#myChart").css("display","block");

}


function returnBarGraph(TOPzarazeni,TOPpreminuli){
    let labels = [];
    let dataset = [];
    let objectArray = [];
    let objectArraySorted = [];
    let datasetFinal = [{
        label: null,
        data: null,
        borderWidth: 1,
        backgroundColor:['rgba(71, 218, 176, 0.8)','rgba(86, 192, 222, 0.8)',
        'rgba(238, 28, 79, 0.8)','rgba(3, 242, 174, 0.8)','rgba(3, 225, 242, 0.8)',
        'rgba(90, 76, 232, 0.8)',
        'rgba(3, 203, 214, 0.8)','rgba(101, 242, 117, 0.8)',
        'rgba(35, 231, 14, 0.8)','rgba(142, 14, 231, 0.8)'],
    }]


    if(TOPzarazeni == true){
    for(let i = 0; i < countryData.length-1;i++){
        objectArray.push(new CountryObject(countryData[i].country,countryData[i].casesPerOneMillion))
        datasetFinal[0].label = 'Broj zarazenih na milion stanovnika'
    }
}
else{
    for(let i = 0; i < countryData.length-1;i++){
        objectArray.push(new CountryObject(countryData[i].country,countryData[i].deathsPerOneMillion))
        datasetFinal[0].label = 'Broj smrtnih slucajeva na milion stanovnika'
    }
}

//sortira
for(let i = 0; i<20;i++){
    objectArraySorted.push(findLargest(objectArray,objectArraySorted));
}
//ubacuje u dataset i labels
for(let i = 0; i <objectArraySorted.length-1;i= i+2){
    dataset.push(objectArraySorted[i].topData);
    labels.push(objectArraySorted[i].name);

}

console.log(objectArraySorted[0].topData);
datasetFinal[0].data = dataset;
datasetFinal[0].labels = labels;

return returnGraph('bar',datasetFinal,labels)

}


function findLargest(array, arraySorted){
let currentLargest = array[0];
for(let i = 0; i < array.length-1;i++){
    if(array[i].topData>currentLargest.topData){
        if(notInArray(arraySorted,array[i].name)){
           currentLargest = array[i]
            
        }
    }
}

return currentLargest;

}



function notInArray(arraySorted, name){
    for(let i = 0; i < arraySorted.length-1; i++){
        if(arraySorted[i].name == name){
            return false;
        }
    }
    return true;
}


//objekat sa propertijima country name i cases per milion
class CountryObject {
    constructor(name, topData) {
        this.name = name;
        this.topData = topData;

    }
}


function returnLineGraph(deaths, confirmed, days){
    let labels = [];
    let dataConfirmed = [];
    let dataDeaths = [];
    let dataset;
    dataset = [{
        label: null,
        backgroundColor: 'rgba(60, 179, 113,0.9)',
        borderColor: 'rgba(60, 179, 113, 0.9)',
        hoverBackgroundColor:'rgba(50 ,150,100,0.9)',
        hoverBorderColor: 'rgba(50 ,150,100,0.9)',
        hoverBorderWidth: 4,
        data: null,
        borderWidth: 1,
        tension: 0.2,

    }]





    if(days == 30 || days == 180){
    for(let i = countryData.length-2;i>= (countryData.length - days)+1;i--){
        labels.push(countryData[i].Date.substring(5,10))
    }
}
else{
    for(let i = countryData.length-2;i>=0;i--){
        labels.push(countryData[i].Date.substring(0,10))
    }    
}


    //OPCIJA 1
    if(confirmed == true && deaths == false ){
        for(let i = countryData.length-2;i>= (countryData.length - days)+1;i--){
            dataConfirmed.push(negativityCheck(countryData[i].Confirmed,countryData[i-1].Confirmed))
            console.log(countryData[i].Confirmed + '-' + countryData[i-1].Confirmed)
        }

        dataset[0].label = 'Broj potvrdjenih slucajeva';
        dataset[0].data = dataConfirmed.reverse();
    
    }

    //OPCIJA 2
    if(confirmed == false && deaths == true ){
        for(let i = countryData.length-2;i>= (countryData.length - days)+1;i--){
            dataDeaths.push(negativityCheck(countryData[i].Deaths,countryData[i-1].Deaths))
        }

        dataset[0].label = 'Broj smrtnih slucajeva'
        dataset[0].data = dataDeaths.reverse();
    
    }


//OPCIJA 3
if(confirmed == true && deaths == true ){
    for(let i = countryData.length-2;i>= (countryData.length - days)+1;i--){
        dataDeaths.push(countryData[i].Deaths-countryData[i-1].Deaths)
        dataConfirmed.push(negativityCheck(countryData[i].Confirmed,countryData[i-1].Confirmed))
    }

    dataset = [{
        label: 'broj preminulih',
        data: dataDeaths.reverse(),
        backgroundColor: 'rgba(0, 0, 255,0.9)',
        borderColor: 'rgba(0, 0, 255,0.9)',
        hoverBackgroundColor:'rgba(0, 70, 200,0.9)',
        hoverBorderColor: 'rgba(0, 70, 200,0.9)',
        borderWidth: 1,
    },
    {label: 'broj potvrdjenih',
    backgroundColor: 'rgba(60, 179, 113,0.9)',
    borderColor: 'rgba(60, 179, 113, 0.9)',
    hoverBackgroundColor:'rgba(50 ,150,100,0.9)',
    hoverBorderColor: 'rgba(50 ,150,100,0.9)',
        data: dataConfirmed.reverse(),
        borderWidth: 1,
    }
    ]

}

//podesava debljinu kruzica za 6mes i od pocetka
if(days>30){
    dataset[0].pointRadius = 0;
}

return returnGraph('line',dataset,labels.reverse());

}


function returnGraph(types, datasets, labelss){

   let Graph = {
        type: types,
        data: {
            labels: labelss,
            datasets: datasets
        },
        options: {
            plugins:{
                legend:{
                    labels:{
                        boxWidth:0,
                    }
                }

            },
            responsive: true,
            scales: {
                y:{
                    beginAtZero:true,
                    suggestedMin: 0,
                }
                 
            }
        }
    }

    return Graph;
}




function negativityCheck(num1, num2){
    if(num1-num2 <0){
    return
    }
    else{
        return num1-num2;
    }
}


// COUNTER
function count(){
  $('.counter-count').each(function () {
        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        }, {
            duration: 2000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });

}