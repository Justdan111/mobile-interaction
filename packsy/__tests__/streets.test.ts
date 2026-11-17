import { buildCity } from '../lib/streets';

describe('generated city', () => {
  it('is identical on every build, so pins can be placed against it', () => {
    expect(buildCity()).toEqual(buildCity());
  });
  it('differs by seed', () => {
    expect(buildCity(1).minor).not.toBe(buildCity(2).minor);
  });
  it('labels Groove Street', () => {
    expect(buildCity().labelName).toBe('Groove Street');
  });
});
