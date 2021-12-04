import Homey from 'homey';
import PairSession from 'homey/lib/PairSession';

class MyDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
  }

  async onPair(session: PairSession) {
    // Show a specific view by ID
    // @ts-ignore
    await session.showView('my_view');
    // Received when a view has changed
    session.setHandler('showView', async viewId => {
      console.log(`View: ${viewId}`);
    });
  }

}

module.exports = MyDriver;
