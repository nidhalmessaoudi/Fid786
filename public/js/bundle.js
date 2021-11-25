/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./client/Main.ts":
/*!************************!*\
  !*** ./client/Main.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var Main = (function () {
    function Main() {
        var userDropdownToggle = document.getElementById("dropdownToggle");
        userDropdownToggle === null || userDropdownToggle === void 0 ? void 0 : userDropdownToggle.addEventListener("click", this.dropdownToggleHandler);
        document.body.addEventListener("click", this.closeFocusedHandler);
    }
    Main.main = function () {
        this.self = new Main();
        return this.self;
    };
    Main.prototype.dropdownToggleHandler = function () {
        var _a;
        if (this.isFocused) {
            return;
        }
        var userDropdownTemplate = document.getElementById("userDropdownTemplate");
        this.isFocused = (_a = userDropdownTemplate.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(userDropdownTemplate.content.cloneNode(true));
    };
    Main.prototype.closeFocusedHandler = function (e) {
        var _a;
        var target = e.target;
        console.log(this.isFocused);
        if (!this.isFocused) {
            return;
        }
        console.log(target.closest(this.isFocused.id));
        if (target.closest(this.isFocused.id)) {
            return;
        }
        (_a = this.isFocused.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this.isFocused);
    };
    return Main;
}());
exports["default"] = Main;


/***/ }),

/***/ "./client/index.ts":
/*!*************************!*\
  !*** ./client/index.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Main_1 = __importDefault(__webpack_require__(/*! ./Main */ "./client/Main.ts"));
window.addEventListener("load", function () { return Main_1.default.main(); });


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./client/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBO0lBSUU7UUFDRSxJQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQ2hELGdCQUFnQixDQUNFLENBQUM7UUFDckIsa0JBQWtCLGFBQWxCLGtCQUFrQix1QkFBbEIsa0JBQWtCLENBQUUsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFTSxTQUFJLEdBQVg7UUFDRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFTyxvQ0FBcUIsR0FBN0I7O1FBQ0UsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLE9BQU87U0FDUjtRQUVELElBQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FDbEQsc0JBQXNCLENBQ0MsQ0FBQztRQUUxQixJQUFJLENBQUMsU0FBUyxHQUFHLDBCQUFvQixDQUFDLGFBQWEsMENBQUUsV0FBVyxDQUM5RCxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBZ0IsQ0FDNUQsQ0FBQztJQUNKLENBQUM7SUFFTyxrQ0FBbUIsR0FBM0IsVUFBNEIsQ0FBUTs7UUFDbEMsSUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQXFCLENBQUM7UUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbkIsT0FBTztTQUNSO1FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUvQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNyQyxPQUFPO1NBQ1I7UUFFRCxVQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsMENBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0gsV0FBQztBQUFELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL0NELG9GQUEwQjtBQUUxQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLGNBQU0scUJBQUksQ0FBQyxJQUFJLEVBQUUsRUFBWCxDQUFXLENBQUMsQ0FBQzs7Ozs7OztVQ0ZuRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2Vic2l0ZS8uL2NsaWVudC9NYWluLnRzIiwid2VicGFjazovL3dlYnNpdGUvLi9jbGllbnQvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJzaXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2Vic2l0ZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFpbiB7XG4gIHB1YmxpYyBzdGF0aWMgc2VsZjogTWFpbjtcbiAgcHJpdmF0ZSBpc0ZvY3VzZWQ/OiBIVE1MRWxlbWVudDtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHVzZXJEcm9wZG93blRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgXCJkcm9wZG93blRvZ2dsZVwiXG4gICAgKSBhcyBIVE1MU3BhbkVsZW1lbnQ7XG4gICAgdXNlckRyb3Bkb3duVG9nZ2xlPy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5kcm9wZG93blRvZ2dsZUhhbmRsZXIpO1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuY2xvc2VGb2N1c2VkSGFuZGxlcik7XG4gIH1cblxuICBzdGF0aWMgbWFpbigpIHtcbiAgICB0aGlzLnNlbGYgPSBuZXcgTWFpbigpO1xuICAgIHJldHVybiB0aGlzLnNlbGY7XG4gIH1cblxuICBwcml2YXRlIGRyb3Bkb3duVG9nZ2xlSGFuZGxlcigpIHtcbiAgICBpZiAodGhpcy5pc0ZvY3VzZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VyRHJvcGRvd25UZW1wbGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgXCJ1c2VyRHJvcGRvd25UZW1wbGF0ZVwiXG4gICAgKSEgYXMgSFRNTFRlbXBsYXRlRWxlbWVudDtcblxuICAgIHRoaXMuaXNGb2N1c2VkID0gdXNlckRyb3Bkb3duVGVtcGxhdGUucGFyZW50RWxlbWVudD8uYXBwZW5kQ2hpbGQoXG4gICAgICB1c2VyRHJvcGRvd25UZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGNsb3NlRm9jdXNlZEhhbmRsZXIoZTogRXZlbnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICBjb25zb2xlLmxvZyh0aGlzLmlzRm9jdXNlZCk7XG5cbiAgICBpZiAoIXRoaXMuaXNGb2N1c2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2codGFyZ2V0LmNsb3Nlc3QodGhpcy5pc0ZvY3VzZWQuaWQpKTtcblxuICAgIGlmICh0YXJnZXQuY2xvc2VzdCh0aGlzLmlzRm9jdXNlZC5pZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmlzRm9jdXNlZC5wYXJlbnRFbGVtZW50Py5yZW1vdmVDaGlsZCh0aGlzLmlzRm9jdXNlZCk7XG4gIH1cbn1cbiIsImltcG9ydCBNYWluIGZyb20gXCIuL01haW5cIjtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IE1haW4ubWFpbigpKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL2NsaWVudC9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==