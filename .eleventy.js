/*
addWatchTarget: https://www.11ty.dev/docs/watch-serve/
addPassthroughCopy: https://www.11ty.dev/docs/copy/
*/

require('dotenv').config();

const path = require("path");
const fs = require("fs");

module.exports = function(eleventyConfig) {
	const build_type = process.env.BUILD || 'prod';
	const config = require(`./confs/eleventy/${build_type}.json`);

	// Setting up global variables for 11ty for use in templates
	if (config.globalData) {
		for (const data of config.globalData) {
			eleventyConfig.addGlobalData(data["name"], data["value"]);
		}
	}

	// Setting up pass through files to be sent to the build directory
	if (config.passThrough) {
        for (const dir of config.passThrough) {
            eleventyConfig.addPassthroughCopy(dir);
        }
    }

	// Setting up watching files to reload after every modification
	if (config.watchList) {
        for (const path of config.watchList) {
            eleventyConfig.addWatchTarget(path);
        }
    }

	eleventyConfig.addFilter("limit", (array, limit) => {
		if (!array) return [];
		return array.slice(0, limit);
	});

	const postDirs = fs.readdirSync("src/posts", { withFileTypes: true })
		.filter(d => d.isDirectory())
		.map(d => d.name);

	postDirs.forEach(dir => {
		eleventyConfig.addCollection(dir, (collectionApi) => {
			return collectionApi.getFilteredByGlob(`src/posts/${dir}/*.md`)
			.sort((a, b) => b.data.date - a.data.date);
		});
	});


	eleventyConfig.addFilter("simplifyDate", (date) => {
		return date.toLocaleString("en-uk");
	});

	eleventyConfig.addNunjucksGlobal("getDataLength", function(name) {
		const data = this.ctx[name];
		if (!data) return 0;
		if (Array.isArray(data)) return data.length;
		if (Array.isArray(data.items)) return data.items.length;
		return 0;
	});
	
	return {
        dir: {
            input: config["input"],
            output: config["output"],
        },
	};
};