export const natsWrapper = {
  client: {
    // publish: (subject: string, data: string, callback: () => void) => {
    //   callback(); Fake implementation
    // },

    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
