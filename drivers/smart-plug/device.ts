import Homey from 'homey';
// @ts-ignore
import TuyAPI from 'tuyapi';

interface tuyAPIResponse {
  dps: {
    '1'?:boolean,
    '18'?:number,
    '19'?:number,
    '20'?:number,
  }
}

class MyDevice extends Homey.Device {

  handleData(input: tuyAPIResponse) {
    if (input && input.dps) {
      if (input.dps['1']) {
        this.setCapabilityValue('onoff', input.dps['1']);
      }
      if (input.dps['18']) {
        this.setCapabilityValue('measure_current', input.dps['18'] / 1000);
      }
      if (input.dps['19']) {
        this.setCapabilityValue('measure_power', input.dps['19'] / 10);
      }
      if (input.dps['20']) {
        this.setCapabilityValue('measure_voltage', input.dps['20'] / 10);
      }
    }
  }

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyDevice has been initialized');
    const { id } = this.getData();
    const { key } = this.getStore();
    const device = new TuyAPI({
      id,
      key,
      version: '3.3',
      issueRefreshOnConnect: true,
    });

    // Find device on network
    device.find().then(() => {
      // Connect to device
      device.connect();
    }).catch(() => {
      console.log(`${this.getName()} - not connected, try again?`);
      setTimeout(() => this.onInit(), 10 * 1000);
    });

    // Add event listeners
    device.on('connected', () => {
      console.log(`${this.getName()} - Connected to device!`);
      setTimeout(() => {
        device.refresh({ dps: 20 });
        device.refresh({ schema: true });
      }, 5000);

      this.registerCapabilityListener('onoff', async (value: boolean) => {
        await device.set({ set: value });
      });
    });

    device.on('disconnected', () => {
      console.log(`${this.getName()} - Disconnected from device.`);
      setTimeout(() => this.onInit(), 10 * 1000);
    });

    device.on('error', (error: any) => {
      console.log(`${this.getName()} - Error!`, error);
    });

    device.on('dp-refresh', (data: tuyAPIResponse) => {
      this.handleData(data);
    });

    device.on('data', (data: tuyAPIResponse) => {
      this.handleData(data);
    });
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: {} }): Promise<string|void> {
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = MyDevice;
