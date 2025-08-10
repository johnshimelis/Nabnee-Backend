//let User= require('../models/model_user');
//let Content = require('../models/model_subject');
//let ContentCat = require('../models/model_content_category');
//let ContentSubCat = require('../models/model_content_subcategory');
let uniqid = require("uniqid");
let Promise = require("bluebird");
let resObj = require("./response.js");
let ConstantCtrl = require("./constants.js");
let fs = require("fs");

module.exports.shuffle = function (array) {
  let ctr = array.length,
    temp,
    index;

  // While there are elements in the array
  while (ctr > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * ctr);
    // Decrease ctr by 1
    ctr--;
    // And swap the last element with it
    temp = array[ctr];
    array[ctr] = array[index];
    array[index] = temp;
  }
  return array;
};

/**
 * Generates a URL-friendly slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} - A URL-friendly slug
 */
module.exports.generateSlug = function (text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except dashes
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

/**
 * Checks if a string is a valid custom URL (slug)
 * @param {string} slug - The slug to validate
 * @returns {boolean} - True if valid, false otherwise
 */
module.exports.isValidSlug = function (slug) {
  // Only allow letters, numbers, and dashes
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};
