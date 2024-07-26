TRANSLATOR =(function(){

	const
		DEBUG = false;

	let
		language,
		globalPlaceholders = {};

	function translate(text,placeholders) {
		if (text.EN !== undefined) text = text[language] || text.EN;
		if (typeof text == 'number')
			return text;
		else
			return text.replace(/\{\{([^}]+)\}\}/g,(m,m1)=>{
				return translate(
					globalPlaceholders[m1] !== undefined ? globalPlaceholders[m1] : ( placeholders[m1] !== undefined ? placeholders[m1] : "???" ) , placeholders);
			});
	}

	return {
		globalSymbols:{},
		translate:(node,placeholders)=>{
			if (DEBUG && node && (node.EN === undefined)) { console.warn("Untranslated string",node); debugger; }
			return translate(node,placeholders);
	    },
		translateObject:(node)=>{
			if (DEBUG && node && (node.EN === undefined)) { console.warn("Untranslated object",node); debugger; }
			return node[language] || node.EN;
		},
	    setLanguage:(l)=>{
	    	language = l;
	    },
	    getLanguage:()=>{
	    	return language;
	    },
		addGlobalPlaceholder:(placeholder,value)=>{
			globalPlaceholders[placeholder] = value;
		}
	}
})();
