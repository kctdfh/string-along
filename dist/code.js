/* @license
Papa Parse
v5.4.1
https://github.com/mholt/PapaParse
License: MIT
*/
!function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof module&&"undefined"!=typeof exports?module.exports=t():e.Papa=t()}(this,function s(){"use strict";var f="undefined"!=typeof self?self:"undefined"!=typeof window?window:void 0!==f?f:{};var n=!f.document&&!!f.postMessage,o=f.IS_PAPA_WORKER||!1,a={},u=0,b={parse:function(e,t){var r=(t=t||{}).dynamicTyping||!1;J(r)&&(t.dynamicTypingFunction=r,r={});if(t.dynamicTyping=r,t.transform=!!J(t.transform)&&t.transform,t.worker&&b.WORKERS_SUPPORTED){var i=function(){if(!b.WORKERS_SUPPORTED)return!1;var e=(r=f.URL||f.webkitURL||null,i=s.toString(),b.BLOB_URL||(b.BLOB_URL=r.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ","(",i,")();"],{type:"text/javascript"})))),t=new f.Worker(e);var r,i;return t.onmessage=_,t.id=u++,a[t.id]=t}();return i.userStep=t.step,i.userChunk=t.chunk,i.userComplete=t.complete,i.userError=t.error,t.step=J(t.step),t.chunk=J(t.chunk),t.complete=J(t.complete),t.error=J(t.error),delete t.worker,void i.postMessage({input:e,config:t,workerId:i.id})}var n=null;b.NODE_STREAM_INPUT,"string"==typeof e?(e=function(e){if(65279===e.charCodeAt(0))return e.slice(1);return e}(e),n=t.download?new l(t):new p(t)):!0===e.readable&&J(e.read)&&J(e.on)?n=new g(t):(f.File&&e instanceof File||e instanceof Object)&&(n=new c(t));return n.stream(e)},unparse:function(e,t){var n=!1,_=!0,m=",",y="\r\n",s='"',a=s+s,r=!1,i=null,o=!1;!function(){if("object"!=typeof t)return;"string"!=typeof t.delimiter||b.BAD_DELIMITERS.filter(function(e){return-1!==t.delimiter.indexOf(e)}).length||(m=t.delimiter);("boolean"==typeof t.quotes||"function"==typeof t.quotes||Array.isArray(t.quotes))&&(n=t.quotes);"boolean"!=typeof t.skipEmptyLines&&"string"!=typeof t.skipEmptyLines||(r=t.skipEmptyLines);"string"==typeof t.newline&&(y=t.newline);"string"==typeof t.quoteChar&&(s=t.quoteChar);"boolean"==typeof t.header&&(_=t.header);if(Array.isArray(t.columns)){if(0===t.columns.length)throw new Error("Option columns is empty");i=t.columns}void 0!==t.escapeChar&&(a=t.escapeChar+s);("boolean"==typeof t.escapeFormulae||t.escapeFormulae instanceof RegExp)&&(o=t.escapeFormulae instanceof RegExp?t.escapeFormulae:/^[=+\-@\t\r].*$/)}();var u=new RegExp(Q(s),"g");"string"==typeof e&&(e=JSON.parse(e));if(Array.isArray(e)){if(!e.length||Array.isArray(e[0]))return h(null,e,r);if("object"==typeof e[0])return h(i||Object.keys(e[0]),e,r)}else if("object"==typeof e)return"string"==typeof e.data&&(e.data=JSON.parse(e.data)),Array.isArray(e.data)&&(e.fields||(e.fields=e.meta&&e.meta.fields||i),e.fields||(e.fields=Array.isArray(e.data[0])?e.fields:"object"==typeof e.data[0]?Object.keys(e.data[0]):[]),Array.isArray(e.data[0])||"object"==typeof e.data[0]||(e.data=[e.data])),h(e.fields||[],e.data||[],r);throw new Error("Unable to serialize unrecognized input");function h(e,t,r){var i="";"string"==typeof e&&(e=JSON.parse(e)),"string"==typeof t&&(t=JSON.parse(t));var n=Array.isArray(e)&&0<e.length,s=!Array.isArray(t[0]);if(n&&_){for(var a=0;a<e.length;a++)0<a&&(i+=m),i+=v(e[a],a);0<t.length&&(i+=y)}for(var o=0;o<t.length;o++){var u=n?e.length:t[o].length,h=!1,f=n?0===Object.keys(t[o]).length:0===t[o].length;if(r&&!n&&(h="greedy"===r?""===t[o].join("").trim():1===t[o].length&&0===t[o][0].length),"greedy"===r&&n){for(var d=[],l=0;l<u;l++){var c=s?e[l]:l;d.push(t[o][c])}h=""===d.join("").trim()}if(!h){for(var p=0;p<u;p++){0<p&&!f&&(i+=m);var g=n&&s?e[p]:p;i+=v(t[o][g],p)}o<t.length-1&&(!r||0<u&&!f)&&(i+=y)}}return i}function v(e,t){if(null==e)return"";if(e.constructor===Date)return JSON.stringify(e).slice(1,25);var r=!1;o&&"string"==typeof e&&o.test(e)&&(e="'"+e,r=!0);var i=e.toString().replace(u,a);return(r=r||!0===n||"function"==typeof n&&n(e,t)||Array.isArray(n)&&n[t]||function(e,t){for(var r=0;r<t.length;r++)if(-1<e.indexOf(t[r]))return!0;return!1}(i,b.BAD_DELIMITERS)||-1<i.indexOf(m)||" "===i.charAt(0)||" "===i.charAt(i.length-1))?s+i+s:i}}};if(b.RECORD_SEP=String.fromCharCode(30),b.UNIT_SEP=String.fromCharCode(31),b.BYTE_ORDER_MARK="\ufeff",b.BAD_DELIMITERS=["\r","\n",'"',b.BYTE_ORDER_MARK],b.WORKERS_SUPPORTED=!n&&!!f.Worker,b.NODE_STREAM_INPUT=1,b.LocalChunkSize=10485760,b.RemoteChunkSize=5242880,b.DefaultDelimiter=",",b.Parser=E,b.ParserHandle=r,b.NetworkStreamer=l,b.FileStreamer=c,b.StringStreamer=p,b.ReadableStreamStreamer=g,f.jQuery){var d=f.jQuery;d.fn.parse=function(o){var r=o.config||{},u=[];return this.each(function(e){if(!("INPUT"===d(this).prop("tagName").toUpperCase()&&"file"===d(this).attr("type").toLowerCase()&&f.FileReader)||!this.files||0===this.files.length)return!0;for(var t=0;t<this.files.length;t++)u.push({file:this.files[t],inputElem:this,instanceConfig:d.extend({},r)})}),e(),this;function e(){if(0!==u.length){var e,t,r,i,n=u[0];if(J(o.before)){var s=o.before(n.file,n.inputElem);if("object"==typeof s){if("abort"===s.action)return e="AbortError",t=n.file,r=n.inputElem,i=s.reason,void(J(o.error)&&o.error({name:e},t,r,i));if("skip"===s.action)return void h();"object"==typeof s.config&&(n.instanceConfig=d.extend(n.instanceConfig,s.config))}else if("skip"===s)return void h()}var a=n.instanceConfig.complete;n.instanceConfig.complete=function(e){J(a)&&a(e,n.file,n.inputElem),h()},b.parse(n.file,n.instanceConfig)}else J(o.complete)&&o.complete()}function h(){u.splice(0,1),e()}}}function h(e){this._handle=null,this._finished=!1,this._completed=!1,this._halted=!1,this._input=null,this._baseIndex=0,this._partialLine="",this._rowCount=0,this._start=0,this._nextChunk=null,this.isFirstChunk=!0,this._completeResults={data:[],errors:[],meta:{}},function(e){var t=w(e);t.chunkSize=parseInt(t.chunkSize),e.step||e.chunk||(t.chunkSize=null);this._handle=new r(t),(this._handle.streamer=this)._config=t}.call(this,e),this.parseChunk=function(e,t){if(this.isFirstChunk&&J(this._config.beforeFirstChunk)){var r=this._config.beforeFirstChunk(e);void 0!==r&&(e=r)}this.isFirstChunk=!1,this._halted=!1;var i=this._partialLine+e;this._partialLine="";var n=this._handle.parse(i,this._baseIndex,!this._finished);if(!this._handle.paused()&&!this._handle.aborted()){var s=n.meta.cursor;this._finished||(this._partialLine=i.substring(s-this._baseIndex),this._baseIndex=s),n&&n.data&&(this._rowCount+=n.data.length);var a=this._finished||this._config.preview&&this._rowCount>=this._config.preview;if(o)f.postMessage({results:n,workerId:b.WORKER_ID,finished:a});else if(J(this._config.chunk)&&!t){if(this._config.chunk(n,this._handle),this._handle.paused()||this._handle.aborted())return void(this._halted=!0);n=void 0,this._completeResults=void 0}return this._config.step||this._config.chunk||(this._completeResults.data=this._completeResults.data.concat(n.data),this._completeResults.errors=this._completeResults.errors.concat(n.errors),this._completeResults.meta=n.meta),this._completed||!a||!J(this._config.complete)||n&&n.meta.aborted||(this._config.complete(this._completeResults,this._input),this._completed=!0),a||n&&n.meta.paused||this._nextChunk(),n}this._halted=!0},this._sendError=function(e){J(this._config.error)?this._config.error(e):o&&this._config.error&&f.postMessage({workerId:b.WORKER_ID,error:e,finished:!1})}}function l(e){var i;(e=e||{}).chunkSize||(e.chunkSize=b.RemoteChunkSize),h.call(this,e),this._nextChunk=n?function(){this._readChunk(),this._chunkLoaded()}:function(){this._readChunk()},this.stream=function(e){this._input=e,this._nextChunk()},this._readChunk=function(){if(this._finished)this._chunkLoaded();else{if(i=new XMLHttpRequest,this._config.withCredentials&&(i.withCredentials=this._config.withCredentials),n||(i.onload=v(this._chunkLoaded,this),i.onerror=v(this._chunkError,this)),i.open(this._config.downloadRequestBody?"POST":"GET",this._input,!n),this._config.downloadRequestHeaders){var e=this._config.downloadRequestHeaders;for(var t in e)i.setRequestHeader(t,e[t])}if(this._config.chunkSize){var r=this._start+this._config.chunkSize-1;i.setRequestHeader("Range","bytes="+this._start+"-"+r)}try{i.send(this._config.downloadRequestBody)}catch(e){this._chunkError(e.message)}n&&0===i.status&&this._chunkError()}},this._chunkLoaded=function(){4===i.readyState&&(i.status<200||400<=i.status?this._chunkError():(this._start+=this._config.chunkSize?this._config.chunkSize:i.responseText.length,this._finished=!this._config.chunkSize||this._start>=function(e){var t=e.getResponseHeader("Content-Range");if(null===t)return-1;return parseInt(t.substring(t.lastIndexOf("/")+1))}(i),this.parseChunk(i.responseText)))},this._chunkError=function(e){var t=i.statusText||e;this._sendError(new Error(t))}}function c(e){var i,n;(e=e||{}).chunkSize||(e.chunkSize=b.LocalChunkSize),h.call(this,e);var s="undefined"!=typeof FileReader;this.stream=function(e){this._input=e,n=e.slice||e.webkitSlice||e.mozSlice,s?((i=new FileReader).onload=v(this._chunkLoaded,this),i.onerror=v(this._chunkError,this)):i=new FileReaderSync,this._nextChunk()},this._nextChunk=function(){this._finished||this._config.preview&&!(this._rowCount<this._config.preview)||this._readChunk()},this._readChunk=function(){var e=this._input;if(this._config.chunkSize){var t=Math.min(this._start+this._config.chunkSize,this._input.size);e=n.call(e,this._start,t)}var r=i.readAsText(e,this._config.encoding);s||this._chunkLoaded({target:{result:r}})},this._chunkLoaded=function(e){this._start+=this._config.chunkSize,this._finished=!this._config.chunkSize||this._start>=this._input.size,this.parseChunk(e.target.result)},this._chunkError=function(){this._sendError(i.error)}}function p(e){var r;h.call(this,e=e||{}),this.stream=function(e){return r=e,this._nextChunk()},this._nextChunk=function(){if(!this._finished){var e,t=this._config.chunkSize;return t?(e=r.substring(0,t),r=r.substring(t)):(e=r,r=""),this._finished=!r,this.parseChunk(e)}}}function g(e){h.call(this,e=e||{});var t=[],r=!0,i=!1;this.pause=function(){h.prototype.pause.apply(this,arguments),this._input.pause()},this.resume=function(){h.prototype.resume.apply(this,arguments),this._input.resume()},this.stream=function(e){this._input=e,this._input.on("data",this._streamData),this._input.on("end",this._streamEnd),this._input.on("error",this._streamError)},this._checkIsFinished=function(){i&&1===t.length&&(this._finished=!0)},this._nextChunk=function(){this._checkIsFinished(),t.length?this.parseChunk(t.shift()):r=!0},this._streamData=v(function(e){try{t.push("string"==typeof e?e:e.toString(this._config.encoding)),r&&(r=!1,this._checkIsFinished(),this.parseChunk(t.shift()))}catch(e){this._streamError(e)}},this),this._streamError=v(function(e){this._streamCleanUp(),this._sendError(e)},this),this._streamEnd=v(function(){this._streamCleanUp(),i=!0,this._streamData("")},this),this._streamCleanUp=v(function(){this._input.removeListener("data",this._streamData),this._input.removeListener("end",this._streamEnd),this._input.removeListener("error",this._streamError)},this)}function r(m){var a,o,u,i=Math.pow(2,53),n=-i,s=/^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/,h=/^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/,t=this,r=0,f=0,d=!1,e=!1,l=[],c={data:[],errors:[],meta:{}};if(J(m.step)){var p=m.step;m.step=function(e){if(c=e,_())g();else{if(g(),0===c.data.length)return;r+=e.data.length,m.preview&&r>m.preview?o.abort():(c.data=c.data[0],p(c,t))}}}function y(e){return"greedy"===m.skipEmptyLines?""===e.join("").trim():1===e.length&&0===e[0].length}function g(){return c&&u&&(k("Delimiter","UndetectableDelimiter","Unable to auto-detect delimiting character; defaulted to '"+b.DefaultDelimiter+"'"),u=!1),m.skipEmptyLines&&(c.data=c.data.filter(function(e){return!y(e)})),_()&&function(){if(!c)return;function e(e,t){J(m.transformHeader)&&(e=m.transformHeader(e,t)),l.push(e)}if(Array.isArray(c.data[0])){for(var t=0;_()&&t<c.data.length;t++)c.data[t].forEach(e);c.data.splice(0,1)}else c.data.forEach(e)}(),function(){if(!c||!m.header&&!m.dynamicTyping&&!m.transform)return c;function e(e,t){var r,i=m.header?{}:[];for(r=0;r<e.length;r++){var n=r,s=e[r];m.header&&(n=r>=l.length?"__parsed_extra":l[r]),m.transform&&(s=m.transform(s,n)),s=v(n,s),"__parsed_extra"===n?(i[n]=i[n]||[],i[n].push(s)):i[n]=s}return m.header&&(r>l.length?k("FieldMismatch","TooManyFields","Too many fields: expected "+l.length+" fields but parsed "+r,f+t):r<l.length&&k("FieldMismatch","TooFewFields","Too few fields: expected "+l.length+" fields but parsed "+r,f+t)),i}var t=1;!c.data.length||Array.isArray(c.data[0])?(c.data=c.data.map(e),t=c.data.length):c.data=e(c.data,0);m.header&&c.meta&&(c.meta.fields=l);return f+=t,c}()}function _(){return m.header&&0===l.length}function v(e,t){return r=e,m.dynamicTypingFunction&&void 0===m.dynamicTyping[r]&&(m.dynamicTyping[r]=m.dynamicTypingFunction(r)),!0===(m.dynamicTyping[r]||m.dynamicTyping)?"true"===t||"TRUE"===t||"false"!==t&&"FALSE"!==t&&(function(e){if(s.test(e)){var t=parseFloat(e);if(n<t&&t<i)return!0}return!1}(t)?parseFloat(t):h.test(t)?new Date(t):""===t?null:t):t;var r}function k(e,t,r,i){var n={type:e,code:t,message:r};void 0!==i&&(n.row=i),c.errors.push(n)}this.parse=function(e,t,r){var i=m.quoteChar||'"';if(m.newline||(m.newline=function(e,t){e=e.substring(0,1048576);var r=new RegExp(Q(t)+"([^]*?)"+Q(t),"gm"),i=(e=e.replace(r,"")).split("\r"),n=e.split("\n"),s=1<n.length&&n[0].length<i[0].length;if(1===i.length||s)return"\n";for(var a=0,o=0;o<i.length;o++)"\n"===i[o][0]&&a++;return a>=i.length/2?"\r\n":"\r"}(e,i)),u=!1,m.delimiter)J(m.delimiter)&&(m.delimiter=m.delimiter(e),c.meta.delimiter=m.delimiter);else{var n=function(e,t,r,i,n){var s,a,o,u;n=n||[",","\t","|",";",b.RECORD_SEP,b.UNIT_SEP];for(var h=0;h<n.length;h++){var f=n[h],d=0,l=0,c=0;o=void 0;for(var p=new E({comments:i,delimiter:f,newline:t,preview:10}).parse(e),g=0;g<p.data.length;g++)if(r&&y(p.data[g]))c++;else{var _=p.data[g].length;l+=_,void 0!==o?0<_&&(d+=Math.abs(_-o),o=_):o=_}0<p.data.length&&(l/=p.data.length-c),(void 0===a||d<=a)&&(void 0===u||u<l)&&1.99<l&&(a=d,s=f,u=l)}return{successful:!!(m.delimiter=s),bestDelimiter:s}}(e,m.newline,m.skipEmptyLines,m.comments,m.delimitersToGuess);n.successful?m.delimiter=n.bestDelimiter:(u=!0,m.delimiter=b.DefaultDelimiter),c.meta.delimiter=m.delimiter}var s=w(m);return m.preview&&m.header&&s.preview++,a=e,o=new E(s),c=o.parse(a,t,r),g(),d?{meta:{paused:!0}}:c||{meta:{paused:!1}}},this.paused=function(){return d},this.pause=function(){d=!0,o.abort(),a=J(m.chunk)?"":a.substring(o.getCharIndex())},this.resume=function(){t.streamer._halted?(d=!1,t.streamer.parseChunk(a,!0)):setTimeout(t.resume,3)},this.aborted=function(){return e},this.abort=function(){e=!0,o.abort(),c.meta.aborted=!0,J(m.complete)&&m.complete(c),a=""}}function Q(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function E(j){var z,M=(j=j||{}).delimiter,P=j.newline,U=j.comments,q=j.step,N=j.preview,B=j.fastMode,K=z=void 0===j.quoteChar||null===j.quoteChar?'"':j.quoteChar;if(void 0!==j.escapeChar&&(K=j.escapeChar),("string"!=typeof M||-1<b.BAD_DELIMITERS.indexOf(M))&&(M=","),U===M)throw new Error("Comment character same as delimiter");!0===U?U="#":("string"!=typeof U||-1<b.BAD_DELIMITERS.indexOf(U))&&(U=!1),"\n"!==P&&"\r"!==P&&"\r\n"!==P&&(P="\n");var W=0,H=!1;this.parse=function(i,t,r){if("string"!=typeof i)throw new Error("Input must be a string");var n=i.length,e=M.length,s=P.length,a=U.length,o=J(q),u=[],h=[],f=[],d=W=0;if(!i)return L();if(j.header&&!t){var l=i.split(P)[0].split(M),c=[],p={},g=!1;for(var _ in l){var m=l[_];J(j.transformHeader)&&(m=j.transformHeader(m,_));var y=m,v=p[m]||0;for(0<v&&(g=!0,y=m+"_"+v),p[m]=v+1;c.includes(y);)y=y+"_"+v;c.push(y)}if(g){var k=i.split(P);k[0]=c.join(M),i=k.join(P)}}if(B||!1!==B&&-1===i.indexOf(z)){for(var b=i.split(P),E=0;E<b.length;E++){if(f=b[E],W+=f.length,E!==b.length-1)W+=P.length;else if(r)return L();if(!U||f.substring(0,a)!==U){if(o){if(u=[],I(f.split(M)),F(),H)return L()}else I(f.split(M));if(N&&N<=E)return u=u.slice(0,N),L(!0)}}return L()}for(var w=i.indexOf(M,W),R=i.indexOf(P,W),C=new RegExp(Q(K)+Q(z),"g"),S=i.indexOf(z,W);;)if(i[W]!==z)if(U&&0===f.length&&i.substring(W,W+a)===U){if(-1===R)return L();W=R+s,R=i.indexOf(P,W),w=i.indexOf(M,W)}else if(-1!==w&&(w<R||-1===R))f.push(i.substring(W,w)),W=w+e,w=i.indexOf(M,W);else{if(-1===R)break;if(f.push(i.substring(W,R)),D(R+s),o&&(F(),H))return L();if(N&&u.length>=N)return L(!0)}else for(S=W,W++;;){if(-1===(S=i.indexOf(z,S+1)))return r||h.push({type:"Quotes",code:"MissingQuotes",message:"Quoted field unterminated",row:u.length,index:W}),T();if(S===n-1)return T(i.substring(W,S).replace(C,z));if(z!==K||i[S+1]!==K){if(z===K||0===S||i[S-1]!==K){-1!==w&&w<S+1&&(w=i.indexOf(M,S+1)),-1!==R&&R<S+1&&(R=i.indexOf(P,S+1));var O=A(-1===R?w:Math.min(w,R));if(i.substr(S+1+O,e)===M){f.push(i.substring(W,S).replace(C,z)),i[W=S+1+O+e]!==z&&(S=i.indexOf(z,W)),w=i.indexOf(M,W),R=i.indexOf(P,W);break}var x=A(R);if(i.substring(S+1+x,S+1+x+s)===P){if(f.push(i.substring(W,S).replace(C,z)),D(S+1+x+s),w=i.indexOf(M,W),S=i.indexOf(z,W),o&&(F(),H))return L();if(N&&u.length>=N)return L(!0);break}h.push({type:"Quotes",code:"InvalidQuotes",message:"Trailing quote on quoted field is malformed",row:u.length,index:W}),S++}}else S++}return T();function I(e){u.push(e),d=W}function A(e){var t=0;if(-1!==e){var r=i.substring(S+1,e);r&&""===r.trim()&&(t=r.length)}return t}function T(e){return r||(void 0===e&&(e=i.substring(W)),f.push(e),W=n,I(f),o&&F()),L()}function D(e){W=e,I(f),f=[],R=i.indexOf(P,W)}function L(e){return{data:u,errors:h,meta:{delimiter:M,linebreak:P,aborted:H,truncated:!!e,cursor:d+(t||0)}}}function F(){q(L()),u=[],h=[]}},this.abort=function(){H=!0},this.getCharIndex=function(){return W}}function _(e){var t=e.data,r=a[t.workerId],i=!1;if(t.error)r.userError(t.error,t.file);else if(t.results&&t.results.data){var n={abort:function(){i=!0,m(t.workerId,{data:[],errors:[],meta:{aborted:!0}})},pause:y,resume:y};if(J(r.userStep)){for(var s=0;s<t.results.data.length&&(r.userStep({data:t.results.data[s],errors:t.results.errors,meta:t.results.meta},n),!i);s++);delete t.results}else J(r.userChunk)&&(r.userChunk(t.results,n,t.file),delete t.results)}t.finished&&!i&&m(t.workerId,t.results)}function m(e,t){var r=a[e];J(r.userComplete)&&r.userComplete(t),r.terminate(),delete a[e]}function y(){throw new Error("Not implemented.")}function w(e){if("object"!=typeof e||null===e)return e;var t=Array.isArray(e)?[]:{};for(var r in e)t[r]=w(e[r]);return t}function v(e,t){return function(){e.apply(t,arguments)}}function J(e){return"function"==typeof e}return o&&(f.onmessage=function(e){var t=e.data;void 0===b.WORKER_ID&&t&&(b.WORKER_ID=t.workerId);if("string"==typeof t.input)f.postMessage({workerId:b.WORKER_ID,results:b.parse(t.input,t.config),finished:!0});else if(f.File&&t.input instanceof File||t.input instanceof Object){var r=b.parse(t.input,t.config);r&&f.postMessage({workerId:b.WORKER_ID,results:r,finished:!0})}}),(l.prototype=Object.create(h.prototype)).constructor=l,(c.prototype=Object.create(h.prototype)).constructor=c,(p.prototype=Object.create(p.prototype)).constructor=p,(g.prototype=Object.create(h.prototype)).constructor=g,b});

console.clear();

function updateVariablesWithJSONRepresentation(json) {
  json.forEach((variable) => {
    const thisVariable = figma.variables.getVariableById(
      variable.variableMeta.id
    );
    variable.modeValues.forEach((mode) => {
      thisVariable.setValueForMode(mode.id, mode.value);
    });
  });
}

function importJSONFile(body) {
  const json = JSON.parse(body);
  updateVariablesWithJSONRepresentation(json);
}

function importCSVFile(body) {
  const pastedValue = body.trim();
  const parsed = Papa.parse(pastedValue, {
    header: true,
    transformHeader: (header) => {
      let newHeader = header
        .trim()
        .replace(/ /g, "")
        .replace(/\)/g, "")
        .replace(/\(/g, "")
        .toLowerCase();
      if (newHeader === "iddonotchange") {
        newHeader = "idcolumn";
      }
      return newHeader;
    },
  }).data;
  let variables = [];
  for (let index = 0; index < parsed.length; index++) {
    const row = parsed[index];
    if (row.string === undefined) {
      row.string = "";
    }
    const variableID = row.idcolumn.split("__")[0];
    const modeId = row.idcolumn.split("__")[1];
    const value = row.string ? row.string : "";
    const variable = variables.find(
      (variable) => variable.variableMeta.id === variableID
    );
    if (variable) {
      const mode = variable.modeValues.find((mode) => mode.id === modeId);
      if (mode) {
        mode.value = value;
      } else {
        variable.modeValues.push({ id: modeId, value: value });
      }
    } else {
      variables.push({
        variableMeta: {
          id: variableID,
        },
        modeValues: [
          {
            id: modeId,
            value: value,
          },
        ],
      });
    }
  }
  updateVariablesWithJSONRepresentation(variables);
  console.log("Import finished");
  figma.ui.postMessage({ type: "IMPORT_RESULT", result: "PASS" });
}

function exportToCSV(collectionId) {
  console.log("Export started");
  const parsedCollection = parseCollectiontoFile(collectionId);
  let csv = [];
  let variableIDs = [];
  parsedCollection.forEach((variable) => {
    variable.modeValues.forEach((mode) => {
      const pushVariable = variableIDs.find(
        (id) => id === variable.variableMeta.id
      );
      if (!pushVariable) {
        variableIDs.push(variable.variableMeta.id);
      }
      const rowID = `${variable.variableMeta.id}__${mode.id}`;
      const row = {
        "ID (do not change)": rowID,
        Name: variable.variableMeta.name,
        Mode: mode.name,
        String: mode.value,
      };
      csv.push(row);
    });
  });
  csv = Papa.unparse(csv, {
    delimiter: "\t",
    header: true,
  });
  getNodesBoundToVariable(variableIDs);
  figma.ui.postMessage({ type: "EXPORT_RESULT", fileType: "CSV", result: csv });
}

function exportToJSON(collectionId) {
  const variables = parseCollectiontoFile(collectionId);
  figma.ui.postMessage({
    type: "EXPORT_RESULT",
    fileType: "JSON",
    result: JSON.stringify(variables, null, 2),
  });
}

function getRootNode(nodeId) {
  let node = figma.getNodeById(nodeId);
  let parent = node.parent;
  while (parent !== null && parent.id !== "0:1") {
    node = parent;
    parent = node.parent;
  }
  return node.id;
}

function getNodesBoundToVariable(variableID) {
  let nodesArray = [];
  figma.skipInvisibleInstanceChildren = true;
  const figmaNodes = figma.currentPage
    .findAllWithCriteria({
      types: ["TEXT"],
    })
    .filter((n) => {
      if (
        n.boundVariables !== undefined &&
        n.boundVariables["characters"] !== undefined &&
        // n.boundVariables["characters"].id === variableID &&
        variableID.includes(n.boundVariables["characters"].id)
      ) {
        return n;
      }
    });
  figmaNodes.forEach((node) => {
    nodesArray.push({
      nodeId: node.id,
      absoluteBoundingBox: node.absoluteBoundingBox,
      rootNode: getRootNode(node.id),
    });
  });
  // console.log(JSON.stringify(nodesArray, null, 2));
  annotateNodesWithVariable(nodesArray);
  return nodesArray;
}

function isCollide(a, b) {
  const val = {
    collision: !(
      a.y + a.height <= b.y ||
      a.y >= b.y + b.height ||
      a.x + a.width <= b.x ||
      a.x >= b.x + b.width
    ),
    overlap: 0,
  };
  if (val.collision) {
    // area of the intersection, which is a rectangle too:
    const SI =
      Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
      Math.max(
        0,
        Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
      );
    // area of the union:
    const SU = a.width * a.height + b.width * b.height - SI;
    // ratio of intersection over union:
    val.overlap = SI / SU;

    // bad approaches
    // val.overlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    // val.overlap = (a.width + b.width) / 2 - Math.abs(a.x - b.x);
    // val.overlap = (a.w * a.h) - (b.w * b.h) / 2 - Math.abs(a.x - b.x);
  } else {
    val.overlap = 0;
  }
  return val;
}

function isOutOfBounds(a, b) {
  const aMiddleX = a.x + a.width / 2;
  const aMiddleY = a.y + a.height / 2;
  return (
    aMiddleX + a.width / 2 > b.x + b.width ||
    aMiddleX - a.width / 2 < b.x ||
    aMiddleY + a.height / 2 > b.y + b.height ||
    aMiddleY - a.height / 2 < b.y
  );
}

function getWrapperXY(
  nodeToPlace,
  targetNode,
  rootNode,
  otherNodes,
  lineLength
) {
  const coordinateResults = [];
  // try to place the node above the target node
  const aboveX = targetNode.x + targetNode.width / 2 - nodeToPlace.width / 2;
  const aboveY = targetNode.y - lineLength - nodeToPlace.height;
  coordinateResults.push({
    placement: "above",
    x: aboveX,
    y: aboveY,
  });
  // check if it collides with any other nodes
  let aboveCollisionInstances = 0;
  const aboveCombinedTargetAndNodeToPlace = {
    x: targetNode.x > aboveX ? aboveX : targetNode.x,
    y: targetNode.y > aboveY ? aboveY : targetNode.y,
    width:
      targetNode.width > nodeToPlace.width
        ? targetNode.width
        : nodeToPlace.width,
    height: nodeToPlace.height + targetNode.height + lineLength,
  };
  otherNodes.forEach((otherNode) => {
    const collides = isCollide(aboveCombinedTargetAndNodeToPlace, otherNode);
    if (collides.collision) {
      aboveCollisionInstances += collides.overlap;
    }
  });
  coordinateResults[0].collisions = aboveCollisionInstances;
  // check if it is out of bounds of the root node
  if (isOutOfBounds(aboveCombinedTargetAndNodeToPlace, rootNode)) {
    coordinateResults[0].outOfBounds = true;
  } else {
    coordinateResults[0].outOfBounds = false;
  }
  // try to place the node below the target node
  const belowX = targetNode.x + targetNode.width / 2 - nodeToPlace.width / 2;
  const belowY = targetNode.y + targetNode.height + lineLength;
  coordinateResults.push({
    placement: "below",
    x: belowX,
    y: belowY,
  });
  // check if it collides with any other nodes
  let belowCollisionInstances = 0;
  const belowCombinedTargetAndNodeToPlace = {
    x: targetNode.x > belowX ? belowX : targetNode.x,
    y: targetNode.y > belowY ? belowY : targetNode.y,
    width:
      targetNode.width > nodeToPlace.width
        ? targetNode.width
        : nodeToPlace.width,
    height: nodeToPlace.height + targetNode.height + lineLength,
  };
  otherNodes.forEach((otherNode) => {
    const collides = isCollide(belowCombinedTargetAndNodeToPlace, otherNode);
    if (collides.collision) {
      belowCollisionInstances += collides.overlap;
    }
  });
  coordinateResults[1].collisions = belowCollisionInstances;
  // check if it is out of bounds of the root node
  if (isOutOfBounds(belowCombinedTargetAndNodeToPlace, rootNode)) {
    coordinateResults[1].outOfBounds = true;
  } else {
    coordinateResults[1].outOfBounds = false;
  }
  // try to place the node to the left of the target node
  const leftX = targetNode.x - lineLength - nodeToPlace.width;
  const leftY = targetNode.y + targetNode.height / 2 - nodeToPlace.height / 2;
  coordinateResults.push({
    placement: "left",
    x: leftX,
    y: leftY,
  });
  // check if it collides with any other nodes
  let leftCollisionInstances = 0;
  const leftCombinedTargetAndNodeToPlace = {
    x: targetNode.x > leftX ? leftX : targetNode.x,
    y: targetNode.y > leftY ? leftY : targetNode.y,
    width: nodeToPlace.width + targetNode.width + lineLength,
    height:
      targetNode.height > nodeToPlace.height
        ? targetNode.height
        : nodeToPlace.height,
  };
  otherNodes.forEach((otherNode) => {
    const collides = isCollide(leftCombinedTargetAndNodeToPlace, otherNode);
    if (collides.collision) {
      leftCollisionInstances += collides.overlap;
    }
  });
  coordinateResults[2].collisions = leftCollisionInstances;
  // check if it is out of bounds of the root node
  if (isOutOfBounds(leftCombinedTargetAndNodeToPlace, rootNode)) {
    coordinateResults[2].outOfBounds = true;
  } else {
    coordinateResults[2].outOfBounds = false;
  }
  // try to place the node to the right of the target node
  const rightX = targetNode.x + targetNode.width + lineLength;
  const rightY = targetNode.y + targetNode.height / 2 - nodeToPlace.height / 2;
  coordinateResults.push({
    placement: "right",
    x: rightX,
    y: rightY,
  });
  // check if it collides with any other nodes
  let rightCollisionInstances = 0;
  const rightCombinedTargetAndNodeToPlace = {
    x: targetNode.x > rightX ? rightX : targetNode.x,
    y: targetNode.y > rightY ? rightY : targetNode.y,
    width: nodeToPlace.width + targetNode.width + lineLength,
    height:
      targetNode.height > nodeToPlace.height
        ? targetNode.height
        : nodeToPlace.height,
  };
  otherNodes.forEach((otherNode) => {
    const collides = isCollide(rightCombinedTargetAndNodeToPlace, otherNode);
    if (collides.collision) {
      rightCollisionInstances += collides.overlap;
    }
  });
  coordinateResults[3].collisions = rightCollisionInstances;
  // check if it is out of bounds of the root node
  if (isOutOfBounds(rightCombinedTargetAndNodeToPlace, rootNode)) {
    coordinateResults[3].outOfBounds = true;
  } else {
    coordinateResults[3].outOfBounds = false;
  }
  // filter out any coordinates that are out of bounds, and sort by collisions
  const filteredCoordinates = coordinateResults
    .filter((coordinate) => {
      return !coordinate.outOfBounds;
    })
    .sort((a, b) => {
      return a.collisions - b.collisions;
    });
  // draw all combined target and node rectangles for debugging
  /* const leftRect = figma.createRectangle();
  leftRect.resize(
    leftCombinedTargetAndNodeToPlace.width,
    leftCombinedTargetAndNodeToPlace.height
  );
  leftRect.x = leftCombinedTargetAndNodeToPlace.x;
  leftRect.y = leftCombinedTargetAndNodeToPlace.y;
  leftRect.fills = [];
  leftRect.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 1 } }];
  leftRect.strokeWeight = 2;
  leftRect.name = `left`;
  const rightRect = figma.createRectangle();
  rightRect.resize(
    rightCombinedTargetAndNodeToPlace.width,
    rightCombinedTargetAndNodeToPlace.height
  );
  rightRect.x = rightCombinedTargetAndNodeToPlace.x;
  rightRect.y = rightCombinedTargetAndNodeToPlace.y;
  rightRect.fills = [];
  rightRect.strokes = [{ type: "SOLID", color: { r: 0, g: 1, b: 0 } }];
  rightRect.strokeWeight = 2;
  rightRect.name = `right`;
  const aboveRect = figma.createRectangle();
  aboveRect.resize(
    aboveCombinedTargetAndNodeToPlace.width,
    aboveCombinedTargetAndNodeToPlace.height
  );
  aboveRect.x = aboveCombinedTargetAndNodeToPlace.x;
  aboveRect.y = aboveCombinedTargetAndNodeToPlace.y;
  aboveRect.fills = [];
  aboveRect.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 0 } }];
  aboveRect.strokeWeight = 2;
  aboveRect.name = `above`;
  const belowRect = figma.createRectangle();
  belowRect.resize(
    belowCombinedTargetAndNodeToPlace.width,
    belowCombinedTargetAndNodeToPlace.height
  );
  belowRect.x = belowCombinedTargetAndNodeToPlace.x;
  belowRect.y = belowCombinedTargetAndNodeToPlace.y;
  belowRect.fills = [];
  belowRect.strokes = [{ type: "SOLID", color: { r: 0, g: 1, b: 1 } }];
  belowRect.strokeWeight = 2;
  belowRect.name = `below`; */
  // if there are no coordinates that are not out of bounds, return the "above" coordinates
  if (filteredCoordinates.length === 0) {
    return {
      x: aboveX,
      y: aboveY,
      placement: "above",
    };
  } else {
    return {
      x: filteredCoordinates[0].x,
      y: filteredCoordinates[0].y,
      placement: filteredCoordinates[0].placement,
    };
  }
}

function getLineXY(annotationNode, targetNode, placement, lineLength) {
  switch (placement) {
    case "above":
      return {
        x: targetNode.x + targetNode.width / 2,
        y: annotationNode.y + annotationNode.height,
      };
    case "below":
      return {
        x: targetNode.x + targetNode.width / 2,
        y: annotationNode.y,
      };
    case "left":
      return {
        x: annotationNode.x + annotationNode.width,
        y: targetNode.y + targetNode.height / 2,
      };
    case "right":
      return {
        x: targetNode.x + targetNode.width,
        y: targetNode.y + targetNode.height / 2,
      };
  }
}

function annotateNodesWithVariable(nodesArray) {
  // group nodesArray by root node
  let aggregatedNodes = nodesArray.sort((a, b) => {
    return a.rootNode > b.rootNode;
  });
  aggregatedNodes = nodesArray.reduce((acc, curr) => {
    const rootNode = curr.rootNode;
    if (acc[rootNode]) {
      acc[rootNode].push(curr);
    } else {
      acc[rootNode] = [curr];
    }
    return acc;
  }, {});
  aggregatedNodes = Object.values(aggregatedNodes);
  // TODO to make sure the annotations are fully done before screenshots are taken, we need to create a promise for each annotation, and then when all the promises are resolved, take the screenshot
  for (
    let nodeArrayIndex = 0;
    nodeArrayIndex < aggregatedNodes.length;
    nodeArrayIndex++
  ) {
    const nodesArray = aggregatedNodes[nodeArrayIndex];
    let existingNodes = [];
    let variableNames = [];
    for (let index = 0; index < nodesArray.length; index++) {
      const node = nodesArray[index];
      const nodeObj = figma.getNodeById(node.nodeId);
      const variableID = nodeObj.boundVariables["characters"].id;
      const variable = figma.variables.getVariableById(variableID);
      const variableName = variable.name;
      if (!variableNames.includes(variableName)) {
        variableNames.push(variableName);
      }
      const rootNode = figma.getNodeById(node.rootNode);
      const rootNodeName = rootNode.name;
      const rootNodeID = rootNode.id;
      const allNodes = nodesArray
        .filter((node) => {
          if (node.rootNode === rootNodeID) {
            return node;
          }
        })
        .map((node) => {
          return figma.getNodeById(node.nodeId);
        });
      allNodes.forEach((node) => {
        existingNodes.push(node);
      });
      // first make sure there isn't already an annotation on the node
      const existingAnnotation = figma.currentPage
        .findAllWithCriteria({
          types: ["GROUP"],
        })
        .filter((n) => {
          if (
            n.getSharedPluginData("stringalong_annotation", "variableName") &&
            getRootNode(n.id) === rootNodeID
          ) {
            return n;
          }
        });
      if (existingAnnotation.length > 0) {
        existingAnnotation.forEach((annotation) => {
          if (!existingNodes.includes(annotation)) {
            existingNodes.push(annotation);
          }
        });
        return;
      }
      // check if the wrapper frame already exists
      const existingWrapper = figma.currentPage
        .findAllWithCriteria({
          types: ["FRAME"],
        })
        .filter((n) => {
          if (
            n.getSharedPluginData(
              "stringalong_annotation_wrapper",
              "rootNodeID"
            ) === rootNodeID
          ) {
            return n;
          }
        });
      let wrapperFame;
      if (existingWrapper.length > 0) {
        const wrapper = existingWrapper[0];
        wrapperFame = wrapper.id;
      } else {
        // create a wrapper frame for the annoations, and place it where the root node is placed and size it to the root node
        const wrapper = figma.createFrame();
        wrapper.name = "stringalong_annotation_wrapper";
        wrapper.x = rootNode.x;
        wrapper.y = rootNode.y;
        wrapper.resize(rootNode.width, rootNode.height);
        wrapper.layoutMode = "NONE";
        wrapper.expanded = false;
        wrapper.fills = [];
        wrapper.setSharedPluginData(
          "stringalong_annotation_wrapper",
          "rootNodeID",
          rootNodeID
        );
        wrapperFame = wrapper.id;
      }
      // create a red stroked rectangle around the node
      const rect = figma.createRectangle();
      rect.resize(
        node.absoluteBoundingBox.width,
        node.absoluteBoundingBox.height
      );
      rect.x = node.absoluteBoundingBox.x;
      rect.y = node.absoluteBoundingBox.y;
      rect.fills = [];
      rect.strokes = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
      rect.strokeWeight = 2;
      rect.name = `${variableName} (${rootNodeName})`;
      rect.setSharedPluginData(
        "stringalong_annotation",
        "variableName",
        variableName
      );
      // create a text node with the variable name and place it on top of the rectangle, centered, with a white background, and a red border, and a line attaching the text node to the rectangle
      // figma.loadFontAsync({ family: "Inter", style: "Regular" })
      const fontLoad = new Promise((resolve) => {
        figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
          resolve();
        });
      });
      fontLoad.then(() => {
        const text = figma.createText();
        // find the width of the text node
        text.characters = variableName;
        text.textAlignHorizontal = "CENTER";
        text.textAlignVertical = "CENTER";
        text.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        text.name = `${variableName} (${rootNodeName})`;
        text.fontSize = 18;
        const textWrapper = figma.createFrame();
        textWrapper.name = `${variableName} (${rootNodeName})`;
        textWrapper.layoutMode = "HORIZONTAL";
        textWrapper.primaryAxisAlignItems = "CENTER";
        textWrapper.counterAxisAlignItems = "CENTER";
        textWrapper.primaryAxisSizingMode = "AUTO";
        textWrapper.counterAxisSizingMode = "AUTO";
        textWrapper.paddingLeft = 20;
        textWrapper.paddingRight = 20;
        textWrapper.paddingTop = 10;
        textWrapper.paddingBottom = 10;
        textWrapper.cornerRadius = 10;
        textWrapper.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
        textWrapper.strokes = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
        textWrapper.appendChild(text);
        const lineLength = textWrapper.height;
        const textWrapperCoordinates = getWrapperXY(
          {
            figmaNode: textWrapper,
            x: textWrapper.absoluteBoundingBox.x,
            y: textWrapper.absoluteBoundingBox.y,
            width: textWrapper.absoluteBoundingBox.width,
            height: textWrapper.absoluteBoundingBox.height,
          },
          {
            figmaNode: nodeObj,
            x: nodeObj.absoluteBoundingBox.x,
            y: nodeObj.absoluteBoundingBox.y,
            width: nodeObj.absoluteBoundingBox.width,
            height: nodeObj.absoluteBoundingBox.height,
          },
          {
            figmaNode: rootNode,
            x: rootNode.absoluteBoundingBox.x,
            y: rootNode.absoluteBoundingBox.y,
            width: rootNode.absoluteBoundingBox.width,
            height: rootNode.absoluteBoundingBox.height,
          },
          existingNodes.map((node) => {
            return {
              figmaNode: node,
              x: node.absoluteBoundingBox.x,
              y: node.absoluteBoundingBox.y,
              width: node.absoluteBoundingBox.width,
              height: node.absoluteBoundingBox.height,
            };
          }),
          lineLength
        );
        textWrapper.x = textWrapperCoordinates.x;
        textWrapper.y = textWrapperCoordinates.y;
        textWrapper.setSharedPluginData(
          "stringalong_annotation",
          "variableName",
          variableName
        );
        // create a line connecting the text node to the rectangle
        const line = figma.createLine();
        // rotate the line 90 degrees
        if (textWrapperCoordinates.placement === "above") {
          line.rotation = -90;
        } else if (textWrapperCoordinates.placement === "below") {
          line.rotation = 90;
        }
        line.resize(lineLength, 0);
        const lineCoordinates = getLineXY(
          {
            figmaNode: textWrapper,
            x: textWrapper.absoluteBoundingBox.x,
            y: textWrapper.absoluteBoundingBox.y,
            width: textWrapper.absoluteBoundingBox.width,
            height: textWrapper.absoluteBoundingBox.height,
          },
          {
            figmaNode: nodeObj,
            x: nodeObj.absoluteBoundingBox.x,
            y: nodeObj.absoluteBoundingBox.y,
            width: nodeObj.absoluteBoundingBox.width,
            height: nodeObj.absoluteBoundingBox.height,
          },
          textWrapperCoordinates.placement,
          lineLength
        );
        line.x = lineCoordinates.x;
        line.y = lineCoordinates.y;
        line.fills = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
        line.strokes = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
        line.strokeWeight = 3;
        line.name = `${variableName} (${rootNodeName})`;
        line.setSharedPluginData(
          "stringalong_annotation",
          "variableName",
          variableName
        );
        // group the rectangle, text node, and line
        // TODO when the root node is auto-layout, the group is not placed in the correct position - the solution is to disable auto-layout on the root node, take the screenshot, then re-enable auto-layout on the root node with the same settings
        const group = figma.group(
          [rect, textWrapper, line],
          figma.getNodeById(wrapperFame)
        );
        group.name = `stringalong_annotation`;
        group.expanded = false;
        group.setSharedPluginData(
          "stringalong_annotation",
          "variableName",
          variableName
        );
        if (!existingNodes.includes(group)) {
          existingNodes.push(group);
        }
        // if it's the last node, wrap the wrapper frame and the rootNode in a group
        if (index === nodesArray.length - 1) {
          console.log("last node");
          const wrapperFrame = figma.getNodeById(wrapperFame);
          const rootNode = figma.getNodeById(node.rootNode);
          const group = figma.group([wrapperFrame, rootNode], rootNode.parent);
          group.name = variableNames.sort().join(" - ");
          group.setSharedPluginData(
            "stringalong_screenshot_group",
            "rootNodeID",
            rootNodeID
          );
          group.expanded = false;
        }
      });
    }
  }
  exportRootNodeScreenshot();
}

function exportRootNodeScreenshot() {
  let nodeScreenshots = [];
  let promises = [];
  const screenShotTargets = figma.currentPage.findChildren((n) =>
    n.getSharedPluginData("stringalong_screenshot_group", "rootNodeID")
  );
  console.log(`Number of nodes to screenshot: ${screenShotTargets.length}`);
  for (let index = 0; index < screenShotTargets.length; index++) {
    const node = screenShotTargets[index];
    const nodeObj = figma.getNodeById(node.id);
    const rootNode = figma.getNodeById(getRootNode(node.id));
    const rootNodeName = rootNode.name;
    const variableID = nodeObj.getSharedPluginData(
      "stringalong_screenshot_group",
      "variableID"
    );
    const variable = figma.variables.getVariableById(variableID);
    const variableName = variable.name;
    const exportOptions = {
      format: "PNG",
      constraint: {
        type: "SCALE",
        value: 1,
      },
    };
    const exportPromise = rootNode
      .exportAsync(exportOptions)
      .then((buffer) => {
        nodeScreenshots.push({
          buffer: buffer,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    promises.push(exportPromise);
  }
  Promise.all(promises).then(() => {
    console.log(nodeScreenshots);
  });
}

function getAllCollections() {
  let collections = figma.variables.getLocalVariableCollections();
  collections = collections.map((collection) => {
    return {
      id: collection.id,
      name: collection.name,
    };
  });
  return collections;
}

function sanatizeString(string) {
  if (
    (string.startsWith(`'`) && string.endsWith(`'`)) ||
    (string.startsWith(`"`) && string.endsWith(`"`))
  ) {
    string = string.slice(1, -1);
  }
  return string;
}

function compareUpdatedVariables(body) {
  const updatedVariables = [];
  body.forEach((variable) => {
    const thisVariable = figma.variables.getVariableById(variable.variableID);
    if (thisVariable !== null) {
      let modeValue = thisVariable.valuesByMode[variable.modeId];
      if (sanatizeString(modeValue) !== sanatizeString(variable.value)) {
        updatedVariables.push({
          variableID: variable.variableID.replace("VariableID:", ""),
          modeId: variable.modeId,
          pastedValue: variable.value,
          figmaValue: modeValue,
        });
      }
    } else {
      console.log("VARIABLE NOT FOUND");
    }
  });
  figma.ui.postMessage({
    type: "COMPARE_RESULT",
    result: JSON.stringify(updatedVariables),
  });
  return updatedVariables;
}

// SECTION Collection parsing functions

// NOTE given a collection ID, parse it
function parseCollectiontoFile(collectionId) {
  const collections = figma.variables.getLocalVariableCollections();
  const files = [];
  collections.forEach((collection) =>
    files.push(...processCollection(collection, collectionId))
  );
  return files;
}

// NOTE given a collection, returns its string variables as an array of objects
function processCollection({ name, modes, variableIds, id }, collectionId) {
  if (collectionId !== undefined && collectionId !== id) {
    figma.ui.postMessage({
      type: "NOTICE",
      result: "BAD_COLLECTION",
    });
    return [];
  }
  const allVariableObjects = [];
  const collectionName = name;
  variableIds.forEach((variableID) => {
    const { name, resolvedType, valuesByMode } =
      figma.variables.getVariableById(variableID);
    if (resolvedType !== "STRING") {
      return;
    }
    const variableObject = {
      collectionMeta: {
        name: collectionName,
        id: id,
      },
      variableMeta: {
        name: name,
        id: variableID,
        // type: resolvedType
      },
      modeValues: [],
      // boundedNodes: getNodesBoundToVariable(variableID),
    };
    modes.forEach(({ modeId, name }) => {
      const value = valuesByMode[modeId];
      const modeObj = {
        id: modeId,
        name,
        value,
      };
      variableObject.modeValues.push(modeObj);
    });
    allVariableObjects.push(variableObject);
  });
  allVariableObjects.sort(
    (a, b) => a.variableMeta.id.split(":")[2] > b.variableMeta.id.split(":")[2]
  );
  return allVariableObjects;
}

// !SECTION Collection parsing functions

// SECTION sending/receiving messages between plugin and code

figma.ui.onmessage = (e) => {
  const submitter = e.submitter;
  const selectedCollectionID = e.collectionId;
  if (e.type === "IMPORT") {
    if (submitter === "JSON") {
      importJSONFile(e.body);
    } else {
      importCSVFile(e.body);
    }
  } else if (e.type === "EXPORT") {
    // handle GET_COLLECTIONS
    if (e.type === "GET_COLLECTIONS") {
      const collections = getAllCollections();
      figma.ui.postMessage({
        type: "GET_COLLECTIONS",
        result: collections,
      });
    }
    // handle submitter
    if (submitter === "JSON") {
      exportToJSON(selectedCollectionID);
    } else {
      exportToCSV(selectedCollectionID);
    }
  } else if (e.type === "TO_COMPARE") {
    compareUpdatedVariables(e.body);
  }
};

if (figma.command === "import") {
  figma.showUI(__uiFiles__["import"], {
    width: 500,
    height: 500,
    themeColors: true,
  });
} else if (figma.command === "export") {
  figma.showUI(__uiFiles__["export"], {
    width: 500,
    height: 500,
    themeColors: true,
  });
  const collections = getAllCollections();
  figma.ui.postMessage({
    type: "GET_COLLECTIONS",
    result: collections,
  });
}

// !SECTION sending/receiving messages between plugin and code
