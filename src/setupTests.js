// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


// Mock `map` for so that it can be loaded in tests
export const mockMapOn = jest.fn();
export const mockMapRemove = jest.fn();
export const mockMapGetCenter = jest.fn();
export const mockMapGetZoom = jest.fn();
export const mockMapGetBearing = jest.fn();
export const mockMapGetPitch = jest.fn();

jest.mock('mapbox-gl', () => ({
  Map: function () {
    this.on = mockMapOn;
    this.remove = mockMapRemove;
    this.getCenter = mockMapGetCenter;
    this.getZoom = mockMapGetZoom   
    this.getBearing = mockMapGetBearing;
    this.getPitch = mockMapGetPitch;
  }
}));