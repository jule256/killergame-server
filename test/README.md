`a-start.js` and  `z-end` are used to establish respectively tear-down the [Mockgoose](https://www.npmjs.com/package/mockgoose) database connection.

Mockgoose is acting somehow unpredictable if `mockgoose(mongoose)` is called more than once.

Since the testing is done alphabetically regarding filenames, I decided to create the two files: `a-start.js` is always processed first and `z-end.js` is always the last file.