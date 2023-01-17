/*Powered By: Manaknightdigital Inc. https://manaknightdigital.com/ Year: 2020*/
/**
 * Pagination Service
 * @copyright 2022 Manaknightdigital Inc.
 * @link https://manaknightdigital.com
 * @license Proprietary Software licensing
 * @author Ryan Wong
 *
 */
module.exports = function (cursor, numItems) {
    this.cursor = cursor ? cursor : 1;
    this.numItems = numItems ? Number(numItems) : 100;
    this.data = [];
    this.count = 0;
    this.sortId = 'id';
    this.direction = 'ASC';
    this.numPages = 0;
  
    this.getItems = function () {
      return this.data;
    };
  
    this.getCursor = function () {
      return this.cursor;
    };
  
    this.getCount = function () {
      return this.count;
    };
  
    this.setCount = function (count) {
      this.count = count;
    };
  
    this.getSortDirection = function () {
      return this.direction;
    };
  
    this.setSortDirection = function (direction) {
      this.direction = direction;
    };
  
    this.getSortField = function () {
      return this.sortId;
    };
  
    this.setSortField = function (sortId) {
      this.sortId = sortId;
    };
  
  
    this.getLimit = function () {
      return this.numItems;
    };
  
    return this;
  };