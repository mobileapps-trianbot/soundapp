import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DataService } from './../data.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Component, OnInit, NgZone } from '@angular/core';
import * as HighCharts from 'highcharts';
import * as moment from 'moment';
import More from 'highcharts/highcharts-more';
import Exporting from 'highcharts/modules/exporting';
import { Chart } from 'angular-highcharts';

Exporting(HighCharts);
More(HighCharts);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  options:any;
  secondChartoptions: any;
  myChart:any;
  guage:any;
  dynamicSpline:any;
  dynamicSpline1:any;
  chartSpeed: any;
  secondValue: any = 0;
  firstValue: any = 0;
  thirdValue: any = 0;
  rpmValue: any = 0;
  columnChart:any;
  constructor(private bluetoothSerial: BluetoothSerial, public dataService: DataService, 
              private ngZone: NgZone, public alertCtrl: AlertController, public router: Router) {
    this.bluetoothSerial.enable();
  }

  ngOnInit() {
   
  }

  async presentAlertConfirm() {
    const alert = await this.alertCtrl.create({
      header: 'Connect',
      message: 'Device not connected.Please connect to device once',
      buttons: [{
          text: 'Okay',
          handler: () => {
            this.router.navigate(['/list']);
          }
        }
      ]
    });

    await alert.present();
  }

  getData() {
  var $this=this;
  this.bluetoothSerial.isConnected().then(data => {
        console.log(data);
        if(data = "0K"){
          setInterval(function() {

            $this.bluetoothSerial.isConnected().then(data => {
              if(data = "0K"){
                $this.bluetoothSerial.read().then((data) => {
                  if(data){
                    if(data.includes(",")){
                      var arr = data.split(';');
                      console.log("array data here",arr)
                      console.log(arr[0]+""+""+arr[1]+""+arr[2].slice(0, -1));
                      var x = (new Date()).getTime();
                      var y = arr[0];
                      // $this.firstValue = arr[0];
                      console.log("final seperated value",arr[0].split(','));
                      var dummyarry=arr[0].split(',')
                      $this.firstValue=dummyarry[0];
                      $this.secondValue=dummyarry[1];
                      // $this.secondValue = arr[1];
                      $this.thirdValue=arr[2].slice(0,-1);
                      var rpm = arr[2].slice(0, -1);
                      if(rpm.includes(";")){
                        $this.rpmValue = rpm.replace(';', '');
                      }else{
                        $this.rpmValue = rpm;
                      }
                    }
                  }
                });
              }
            },err => {
              console.log(err);
              $this.firstValue = '';
              $this.secondValue = '';
              $this.thirdValue = '';
            });
          }, 1000);
        }
    },err => {
      console.log(err);
    });
  }

  ionViewDidEnter() {
    console.log("view enter");
    // this.plotSimpleSplineChart();
    var $this=this;
    if( localStorage.getItem('devicedata') == null ){
     this.presentAlertConfirm();
    }else{
      console.log(JSON.parse(localStorage.getItem('devicedata')));
      var device = JSON.parse(localStorage.getItem('devicedata'));
      this.bluetoothSerial.isConnected().then(data => {
        if(data = "0K"){
          $this.getData();
        }
      },err => {
        console.log(err);
        $this.bluetoothSerial.connect(device.address).subscribe(data => {
          console.log(data);
          $this.getData();
        // this.deviceConnected();
        }, $this.fail);
      });
    }
    this.plotSimpleSplineChart1();
    // this.plotColumnChart();
  }

  fail = (error) => alert(error);

  // getDataChart() {
  //   var $this = this;
  //   let body = {
  //     "patientkey":"10"
  //   }
  //   console.log(body);
  //   $this.dataService.getDatafrom(body).subscribe(data => {
  //     console.log(data.body);
  //     var series = $this.myChart.series[0];
  //     var x = new Date().getTime();
  //     var y = "2";
  //     series.addPoint([x, y], true, true);
  //     setTimeout(this.getDataChart, 5000);
  //   }, err => {
  //     console.log(err);
  //   });
  // }

  plotSimpleSplineChart() {
    var $this= this;
    this.options = {
      chart: {
        type: 'spline',
        animation: true, // don't animate in old IE
        marginRight: 10,
        height: 230,
        events: {
          load: function () {
            var series = this.series[0];
            setInterval(function() {
              if($this.firstValue == '' || $this.firstValue == undefined){
              }else{
                var x = (new Date()).getTime();
                series.addPoint([x, parseInt($this.firstValue)], true, true);
              }
            }, 1000);
          }
        }
      },

      time: {
        useUTC: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Sensor1'
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
      },
      yAxis: {
        title: {
          text: 'Sound 1'
        },
        gridLineWidth: 0,
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        headerFormat: '<b>{series.name}</b><br/>',
        pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      series: [{
        name: 'Sensor data',
        data: (function () {
          var data = [],
              time = (new Date()).getTime(),
              i;

          for (i = -15; i <= 0; i += 1) {
              data.push({
                  x: time + i * 1000,
                  y: Math.floor(Math.random() * 10) + 0
              });
          }
          return data;
        }())
      }]

    }
    // this.dynamicSpline = HighCharts.chart('dynamicSpline', );
    this.dynamicSpline = new Chart(this.options);
  }

  plotSimpleSplineChart1() {
    var $this= this;
    this.secondChartoptions = {
      chart: {
        type: 'line',
        animation: true, // don't animate in old IE
        marginRight: 10,
        backgroundColor: null,
        // height: 670,
        events: {
          load: function () {
              console.log($this.secondValue+"this us second");
              var series = this.series[0];
              var series1 = this.series[1];
              // var series2 = this.series[2];

              setInterval(function() {
                if($this.thirdValue == '' || $this.thirdValue == undefined ||$this.secondValue == '' || $this.secondValue == undefined || $this.firstValue == '' || $this.firstValue == undefined){
                  
                }else{
                  var x = (new Date()).getTime();
                  series.addPoint([x, parseInt($this.firstValue)], true, true);
                  series1.addPoint([x, parseInt($this.secondValue)], true, true);
                  // series2.addPoint([x, parseInt($this.secondValue)], true, true);
                }
              }, 500);
          }
        }
      },

      time: {
        useUTC: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Sound Level'
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
      },
      yAxis: {
        title: {
          text: 'Sensor Data'
        },
        gridLineWidth: 0,
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        min: 50,
        tickInterval: 5,
        max: 100,
      },
      tooltip: {
        headerFormat: '<b>{series.name}</b><br/>',
        pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      series: [{
        name: 'Sensor1',
        type: undefined,
        marker: {
          enabled: false,
        },
        color: '#0B9962',
        data: (function () {
          var data = [],
              time = (new Date()).getTime(),
              i;

          for (i = -15; i <= 0; i += 1) {
              data.push({
                  x: time + i * 1000,
                  y: Math.floor(Math.random() * 10) + 60
              });
          }
          return data;
      }())
      },
      {
        name: 'Sensor2',
        type: undefined,
        color: 'red',
        marker: {
          enabled: false,
        },
        data: (function () {
          var data = [],
              time = (new Date()).getTime(),
              i;

          for (i = -15; i <= 0; i += 1) {
              data.push({
                  x: time + i * 1000,
                  y: Math.floor(Math.random() * 10) + 50
              });
          }
          return data;
      }())
      }]

    }
    this.dynamicSpline1 = new Chart(this.secondChartoptions);
  }

  plotColumnChart() {
    let $this = this;
    this.options = {
      chart: {
        type: 'column',
        height: 200,
        width:150
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: ['Sensor1'],
        labels: {
          enabled:false
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: { enabled: false },
      yAxis: {
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        title: {
          text: ''
        },
        min:0,
        tickInterval: 20,
        max:100
      },
      plotOptions: {
              series: {
                  pointWidth: 30
              }
      },
      series: [{
        name: 'Value',
        color:'#0B9962',
        data: [this.firstValue]
      }]
    };
    this.columnChart = new Chart(this.options);
}

}
