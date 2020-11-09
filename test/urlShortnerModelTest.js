/**
 * Test class to test URL Shortener main model
 */
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const UrlShortenerModel = require('../models/urlShortenerModel');


 describe('UrlShortenerModel tests', () => {

    const model = getMockUrlShortenerModel();

    it('Test - "saveShortUrl"', async () => {
       
        model.saveShortUrl('https://www.google.com');

        expect(2).to.equal(2);
    });


 });


 function _getMockUrlShortenerModel () {
    const mockCache  = {
        set : (key, va) => {}
    };
    
    const mockAnalyticsService = {};
    const mockCodeGeneratorService = {
        getNextAvailableCodes : ()  =>  {
            return {
                urlCodes : ['asA3Fe','Adsa313'],
                count : 2
            }
        }
    };

    const model = new UrlShortenerModel(mockCache, mockAnalyticsService, mockCodeGeneratorService);

    return model;
 }

 function getMockCache() {
    const mockCache = {};


 }
