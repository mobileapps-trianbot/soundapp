import { DataService } from './../data.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import * as _ from "lodash";

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
  output: any;
  message: string;
  responseTxt: any;
  unpairedDevices: any;
  pairedDevices: any;
  statusMessage: string;
  gettingDevices: Boolean;
  array: any;
  usertype: any;
  deviceaddress:any;
  dataSend: any;
  devicesAdded = [];
   dist_arr = [];
   temparry=[];
  constructor(public bluetoothSerial: BluetoothSerial, private alertCtrl: AlertController, private ngZone: NgZone,
              private toastCtrl: ToastController, private dataSer: DataService, private router: Router) {
      this.bluetoothSerial.enable();
  }

  ngOnInit() {
  }

  startScanning() {
    this.pairedDevices = null;
    this.unpairedDevices = null;
    this.gettingDevices = true;
    this.bluetoothSerial.discoverUnpaired().then((success) => {
      this.unpairedDevices = success;
      console.log(this.unpairedDevices);
      this.temparry = [];
     
      // var index: any;
      // for(index in this.unpairedDevices){
      //    if(dist_arr.indexOf(this.unpairedDevices[index].name) < 0){
      //      console.log("index valuenn",this.unpairedDevices[index].name,index);
         
      //      dist_arr.push(this.unpairedDevices[index].name);
      //    }
      // }
      var index: any;
      for(index in this.unpairedDevices){
         if(this.unpairedDevices[index].name){
           console.log("not empty",this.unpairedDevices[index]);
           this.temparry.push(this.unpairedDevices[index]);
         }
      }
      this.dist_arr = _.uniqBy(this.temparry, 'name');
      console.log("device  list here",this.dist_arr)
      this.gettingDevices = false;
      success.forEach(element => {

      });
    },
      (err) => {
        console.log(err);
      })

    this.bluetoothSerial.list().then((success) => {
      this.pairedDevices = success;
    },
      (err) => {

      })
  }

  success(data,device) {
    this.presentAlertConfirm(data);
  }
  fail = (error) => alert(error);


  async presentAlertConfirm(data) {
    const alert = await this.alertCtrl.create({
      header: 'Connected',
      message: 'Connected to device'+data,
      buttons: [ {
          text: 'Okay',
          handler: () => {
            this.router.navigate(['/home']);
          }
        }
      ]
    });

    await alert.present();
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe('\n').subscribe(success => {
      this.handleData(success);
      this.presentToast("Connected Successfullly");
    }, error => {
      alert(error);
    });
  }

  handleData(data) {
    this.presentToast(data);
  }

  selectDevice(device: any) {

    this.alertCtrl.create({
      header: 'Connect',
      message: 'Do you want to connect with?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Connect',
          handler: () => {
            this.bluetoothSerial.connect(device.address).subscribe(data => {
              localStorage.setItem('devicedata',JSON.stringify(device));
              this.success(data, device);
              console.log(device);
              // this.deviceConnected();
            }, this.fail);

          }
        }
      ]
    }).then(res => {
      res.present();
    });

  }


  disconnect() {
    this.alertCtrl.create({
      header: 'Disconnect?',
      message: 'Do you want to Disconnect?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.alertCtrl.dismiss();
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this.bluetoothSerial.disconnect();
            this.gettingDevices = null;
          }
        }
      ]
    }).then(res => {
      res.present();
    });
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  data() {
    setInterval(() => {
      this.read1();
    }, 3000);
  }

  read() {
    this.bluetoothSerial.read().then((data) => {
      // console.log(data);
      this.array = data.split(';');
      for (let i = 0; i < this.array.length; i++) {
            this.addData(this.array[i]);
      }
    });
  }

  read1() {
    this.ngZone.run(() => {
      this.read();
    });
  }

  addData(array){
    let senddata = array.split(',')
    console.log(this.deviceaddress);
    let body = {
        "heartbeat": senddata[0],
        "temperature":"",
        "humidity":"",
        "patientkey":"10"
    }
    console.log(body);
    this.dataSer.insertData(body).subscribe(data => {
      console.log(data);
    }, err => {
      console.log(err);
    });
  }
}

