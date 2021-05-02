import * as logger from "../server/Logger";


describe('Create Info Log', () => {
  it('Shoud be possible to create Info Log', async () => {
    logger.info("My New Info Message", "Main");
  });

  it('Shoud be possible to create Debug Log', async () => {
    logger.debug("Debug Message", "Main");
  });
});

