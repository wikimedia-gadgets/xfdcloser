// <nowiki>
export default class Month {
	/**
	 * 
	 * @param {Number} index zero-indexed month number, 0 to 11 
	 */
	constructor(index) {
		this.index = index;
	}
	static names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	get name() {
		return Month.names[this.index];
	}
	get shortName() {
		return this.name.slice(0,3);
	}
	get number() {
		return this.index + 1;
	}
	get paddedNumber() {
		return (this.number < 10 ? "0" : "") + this.number;
	}
	isValid() {
		return typeof this.index === "number" && 0 <= this.index && this.index <= 11;
	}

	// Alternatives constructors

	/**
	 * 
	 * @param {Number} number month number, 1 to 12 
	 */
	static newFromMonthNumber(number) {
		const index = number - 1;
		const month = new Month(index);
		return month;
	}
	/**
	 * 
	 * @param {String} name month's name (capitlisation does not matter)
	 */
	static newFromMonthName(monthname) {
		const index = Month.names.findIndex(name => name.toLowerCase() === monthname.toLowerCase());
		const month = new Month(index);
		return month;
	}
	/**
	 * 
	 * @param {String} shortname month's short name (capitlisation does not matter), e.g. "Jan", "FEB", "mar"
	 */
	static newFromMonthShortName(shortname) {
		const index = Month.names.findIndex(name => name.slice(0,3).toLowerCase() === shortname.toLowerCase());
		const month = new Month(index);
		return month;
	}

	// Get the name directly without returning a Month object
	/**
	 * 
	 * @param {Number} index zero-indexed month number, 0 to 11 
	 */
	static nameFromIndex(index) {
		return (new Month(index)).name;
	}
	/**
	 * 
	 * @param {Number} number month number, 1 to 12 
	 */
	static nameFromNumber(number) {
		return Month.newFromMonthNumber(number).name;
	}

	// Get the short name directly without returning a Month object

	/**
	 * 
	 * @param {Number} index zero-indexed month number, 0 to 11 
	 */
	static shortNameFromIndex(index) {
		return (new Month(index)).shortName;
	}
	/**
	 * 
	 * @param {Number} number month number, 1 to 12 
	 */
	static shortNameFromNumber(number) {
		return Month.newFromMonthNumber(number).shortName;
	}

	// Get the index directly without returning a Month object

	/**
	 * 
	 * @param {String} name month's name (capitlisation does not matter)
	 */
	static indexFromName(monthname) {
		return Month.newFromMonthName(monthname).index;
	}
	/**
	 * 
	 * @param {String} shortname month's short name (capitlisation does not matter), e.g. "Jan", "FEB", "mar"
	 */
	static indexFromShortName(shortName) {
		return Month.newFromMonthShortName(shortName).index;
	}

	// Get the number directly without returning a Month object

	/**
	 * 
	 * @param {String} name month's name (capitlisation does not matter)
	 * @param {Object} option
	 * @param {Boolean} option.pad zero-pad the output, if needed; returns a string instead of a number
	 */
	static numberFromName(monthname, option) {
		return Month.newFromMonthName(monthname)[option.pad ? "paddedNumber" : "number"];
	}
	/**
	 * 
	 * @param {String} shortname month's short name (capitlisation does not matter), e.g. "Jan", "FEB", "mar"
	 * @param {Object} option
	 * @param {Boolean} option.pad zero-pad the output, if needed; returns a string instead of a number
	 */
	static numberFromShortName(shortName, option) {
		return Month.newFromMonthShortName(shortName)[option.pad ? "paddedNumber" : "number"];
	}
}
// </nowiki>