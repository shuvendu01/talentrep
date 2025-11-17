(()=>{var e={};e.id=8923,e.ids=[8923],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},27790:e=>{"use strict";e.exports=require("assert")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},32694:e=>{"use strict";e.exports=require("http2")},35240:e=>{"use strict";e.exports=require("https")},19801:e=>{"use strict";e.exports=require("os")},55315:e=>{"use strict";e.exports=require("path")},76162:e=>{"use strict";e.exports=require("stream")},74175:e=>{"use strict";e.exports=require("tty")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},18258:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>o.a,__next_app__:()=>u,originalPathname:()=>p,pages:()=>c,routeModule:()=>m,tree:()=>l}),s(38639),s(11887),s(35866);var r=s(23191),i=s(88716),a=s(37922),o=s.n(a),n=s(95231),d={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>n[e]);s.d(t,d);let l=["",{children:["credits",{children:["purchase",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,38639)),"/app/frontend/src/app/credits/purchase/page.js"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,11887)),"/app/frontend/src/app/layout.js"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,35866,23)),"next/dist/client/components/not-found-error"]}],c=["/app/frontend/src/app/credits/purchase/page.js"],p="/credits/purchase/page",u={require:s,loadChunk:()=>Promise.resolve()},m=new r.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/credits/purchase/page",pathname:"/credits/purchase",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},4928:(e,t,s)=>{Promise.resolve().then(s.bind(s,72853))},32933:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(62881).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},28916:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(62881).Z)("credit-card",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]])},3634:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(62881).Z)("zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]])},72853:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>m});var r=s(10326),i=s(17577),a=s(35047),o=s(21831),n=s(13783),d=s(997),l=s(3634),c=s(32933),p=s(28916);s(98866);var u=s(40381);function m(){(0,a.useRouter)();let[e,t]=(0,i.useState)(null),[s,m]=(0,i.useState)(!0),[x,h]=(0,i.useState)(0),[f,b]=(0,i.useState)(null),g=e=>{b(e),(0,u.Am)("Payment integration coming soon! This will connect to Stripe.",{icon:"\uD83D\uDCB3"})};return s?r.jsx(o.Z,{children:r.jsx("div",{className:"flex items-center justify-center h-96",children:r.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"})})}):r.jsx(o.Z,{children:(0,r.jsxs)("div",{className:"p-8",children:[(0,r.jsxs)("div",{className:"mb-8",children:[r.jsx("h1",{className:"text-3xl font-bold text-white mb-2",children:"Purchase Credits"}),r.jsx("p",{className:"text-gray-400",children:"Invest in your career growth with skill verification interviews"})]}),r.jsx("div",{className:"bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 mb-8",children:(0,r.jsxs)("div",{className:"flex items-center justify-between",children:[(0,r.jsxs)("div",{children:[r.jsx("p",{className:"text-blue-100 text-sm mb-1",children:"Current Balance"}),r.jsx("p",{className:"text-4xl font-bold text-white",children:x.toLocaleString()}),r.jsx("p",{className:"text-blue-100 text-sm mt-1",children:"credits available"})]}),r.jsx(n.Z,{className:"h-16 w-16 text-white opacity-20"})]})}),(0,r.jsxs)("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8",children:[r.jsx("h3",{className:"text-lg font-semibold text-white mb-4",children:"How Credits Work"}),(0,r.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[(0,r.jsxs)("div",{className:"flex items-start gap-3",children:[r.jsx("div",{className:"w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0",children:r.jsx(d.Z,{className:"h-5 w-5 text-blue-400"})}),(0,r.jsxs)("div",{children:[r.jsx("p",{className:"text-white font-medium mb-1",children:"Interview Request"}),r.jsx("p",{className:"text-sm text-gray-400",children:"6,000 credits per interview verification"})]})]}),(0,r.jsxs)("div",{className:"flex items-start gap-3",children:[r.jsx("div",{className:"w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0",children:r.jsx(l.Z,{className:"h-5 w-5 text-green-400"})}),(0,r.jsxs)("div",{children:[r.jsx("p",{className:"text-white font-medium mb-1",children:"Instant Delivery"}),r.jsx("p",{className:"text-sm text-gray-400",children:"Credits added to your account immediately"})]})]}),(0,r.jsxs)("div",{className:"flex items-start gap-3",children:[r.jsx("div",{className:"w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0",children:r.jsx(c.Z,{className:"h-5 w-5 text-purple-400"})}),(0,r.jsxs)("div",{children:[r.jsx("p",{className:"text-white font-medium mb-1",children:"Never Expire"}),r.jsx("p",{className:"text-sm text-gray-400",children:"Use your credits whenever you need"})]})]})]})]}),r.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",children:[{id:"starter",name:"Starter Pack",credits:1e4,price:49,popular:!1,interviews:"~1-2 interviews",perCredit:.0049,features:["Instant credit delivery","30-day money-back","Email support"]},{id:"popular",name:"Popular Pack",credits:25e3,price:99,popular:!0,interviews:"~4 interviews",perCredit:.00396,savings:20,features:["Instant credit delivery","30-day money-back","Priority support","20% savings"]},{id:"premium",name:"Premium Pack",credits:5e4,price:179,popular:!1,interviews:"~8 interviews",perCredit:.00358,savings:28,features:["Instant credit delivery","30-day money-back","Priority support","28% savings","Bonus credits"]}].map(e=>(0,r.jsxs)("div",{className:`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:scale-105 transition-all ${e.popular?"border-blue-500 shadow-lg shadow-blue-500/20":"border-white/10"} relative`,children:[e.popular&&r.jsx("div",{className:"absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full",children:r.jsx("span",{className:"text-white text-xs font-bold",children:"MOST POPULAR"})}),(0,r.jsxs)("div",{className:"mb-6 mt-2",children:[r.jsx("h3",{className:"text-xl font-bold text-white mb-2",children:e.name}),(0,r.jsxs)("div",{className:"flex items-baseline gap-2 mb-1",children:[(0,r.jsxs)("span",{className:"text-4xl font-bold text-white",children:["$",e.price]}),r.jsx("span",{className:"text-gray-400",children:"USD"})]}),(0,r.jsxs)("p",{className:"text-gray-400 text-sm",children:[e.credits.toLocaleString()," credits"]}),e.savings&&r.jsx("div",{className:"inline-block mt-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full",children:(0,r.jsxs)("span",{className:"text-green-400 text-xs font-semibold",children:["Save ",e.savings,"%"]})})]}),(0,r.jsxs)("div",{className:"mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl",children:[r.jsx("p",{className:"text-blue-400 font-medium text-sm",children:e.interviews}),(0,r.jsxs)("p",{className:"text-xs text-gray-400 mt-1",children:["$",e.perCredit.toFixed(5)," per credit"]})]}),r.jsx("div",{className:"space-y-3 mb-6",children:e.features.map((e,t)=>(0,r.jsxs)("div",{className:"flex items-center gap-2",children:[r.jsx(c.Z,{className:"h-4 w-4 text-green-400 flex-shrink-0"}),r.jsx("span",{className:"text-sm text-gray-300",children:e})]},t))}),(0,r.jsxs)("button",{onClick:()=>g(e),className:`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${e.popular?"bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90":"bg-white/10 border border-white/20 text-white hover:bg-white/20"}`,children:[r.jsx(p.Z,{className:"h-5 w-5"}),"Purchase Now"]})]},e.id))}),(0,r.jsxs)("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6",children:[r.jsx("h3",{className:"text-lg font-semibold text-white mb-4",children:"Frequently Asked Questions"}),(0,r.jsxs)("div",{className:"space-y-4",children:[(0,r.jsxs)("div",{children:[r.jsx("p",{className:"text-white font-medium mb-1",children:"How do I use my credits?"}),r.jsx("p",{className:"text-sm text-gray-400",children:"Credits are automatically deducted when you request a skill verification interview. Each interview costs 6,000 credits."})]}),(0,r.jsxs)("div",{children:[r.jsx("p",{className:"text-white font-medium mb-1",children:"Can I get a refund?"}),r.jsx("p",{className:"text-sm text-gray-400",children:"Yes! Unused purchased credits can be refunded within 30 days of purchase. Contact support for assistance."})]}),(0,r.jsxs)("div",{children:[r.jsx("p",{className:"text-white font-medium mb-1",children:"What payment methods do you accept?"}),r.jsx("p",{className:"text-sm text-gray-400",children:"We accept all major credit cards, debit cards, and PayPal through our secure payment processor."})]})]})]})]})})}},38639:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>r});let r=(0,s(68570).createProxy)(String.raw`/app/frontend/src/app/credits/purchase/page.js#default`)},40381:(e,t,s)=>{"use strict";s.d(t,{Am:()=>O});var r,i=s(17577);let a={data:""},o=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||a},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let s="",r="",i="";for(let a in e){let o=e[a];"@"==a[0]?"i"==a[1]?s=a+" "+o+";":r+="f"==a[1]?c(o,a):a+"{"+c(o,"k"==a[1]?"":t)+"}":"object"==typeof o?r+=c(o,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):a):null!=o&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=c.p?c.p(a,o):a+":"+o+";")}return s+(t&&i?t+"{"+i+"}":i)+r},p={},u=e=>{if("object"==typeof e){let t="";for(let s in e)t+=s+u(e[s]);return t}return e},m=(e,t,s,r,i)=>{let a=u(e),o=p[a]||(p[a]=(e=>{let t=0,s=11;for(;t<e.length;)s=101*s+e.charCodeAt(t++)>>>0;return"go"+s})(a));if(!p[o]){let t=a!==e?e:(e=>{let t,s,r=[{}];for(;t=n.exec(e.replace(d,""));)t[4]?r.shift():t[3]?(s=t[3].replace(l," ").trim(),r.unshift(r[0][s]=r[0][s]||{})):r[0][t[1]]=t[2].replace(l," ").trim();return r[0]})(e);p[o]=c(i?{["@keyframes "+o]:t}:t,s?"":"."+o)}let m=s&&p.g?p.g:null;return s&&(p.g=p[o]),((e,t,s,r)=>{r?t.data=t.data.replace(r,e):-1===t.data.indexOf(e)&&(t.data=s?e+t.data:t.data+e)})(p[o],t,r,m),o},x=(e,t,s)=>e.reduce((e,r,i)=>{let a=t[i];if(a&&a.call){let e=a(s),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+r+(null==a?"":a)},"");function h(e){let t=this||{},s=e.call?e(t.p):e;return m(s.unshift?s.raw?x(s,[].slice.call(arguments,1),t.p):s.reduce((e,s)=>Object.assign(e,s&&s.call?s(t.p):s),{}):s,o(t.target),t.g,t.o,t.k)}h.bind({g:1});let f,b,g,y=h.bind({k:1});function v(e,t){let s=this||{};return function(){let r=arguments;function i(a,o){let n=Object.assign({},a),d=n.className||i.className;s.p=Object.assign({theme:b&&b()},n),s.o=/ *go\d+/.test(d),n.className=h.apply(s,r)+(d?" "+d:""),t&&(n.ref=o);let l=e;return e[0]&&(l=n.as||e,delete n.as),g&&l[0]&&g(n),f(l,n)}return t?t(i):i}}var j=e=>"function"==typeof e,w=(e,t)=>j(e)?e(t):e,N=(()=>{let e=0;return()=>(++e).toString()})(),k=((()=>{let e;return()=>e})(),"default"),P=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return P(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||void 0===i?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},q=[],_={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},A={},C=(e,t=k)=>{A[t]=P(A[t]||_,e),q.forEach(([e,s])=>{e===t&&s(A[t])})},$=e=>Object.keys(A).forEach(t=>C(e,t)),S=e=>Object.keys(A).find(t=>A[t].toasts.some(t=>t.id===e)),Z=(e=k)=>t=>{C(t,e)},I={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},E=(e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(null==s?void 0:s.id)||N()}),z=e=>(t,s)=>{let r=E(t,e,s);return Z(r.toasterId||S(r.id))({type:2,toast:r}),r.id},O=(e,t)=>z("blank")(e,t);O.error=z("error"),O.success=z("success"),O.loading=z("loading"),O.custom=z("custom"),O.dismiss=(e,t)=>{let s={type:3,toastId:e};t?Z(t)(s):$(s)},O.dismissAll=e=>O.dismiss(void 0,e),O.remove=(e,t)=>{let s={type:4,toastId:e};t?Z(t)(s):$(s)},O.removeAll=e=>O.remove(void 0,e),O.promise=(e,t,s)=>{let r=O.loading(t.loading,{...s,...null==s?void 0:s.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let i=t.success?w(t.success,e):void 0;return i?O.success(i,{id:r,...s,...null==s?void 0:s.success}):O.dismiss(r),e}).catch(e=>{let i=t.error?w(t.error,e):void 0;i?O.error(i,{id:r,...s,...null==s?void 0:s.error}):O.dismiss(r)}),e};var D=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,L=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,M=y`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,F=(v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${D} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${L} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${M} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,y`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`),G=(v("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${F} 1s linear infinite;
`,y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`),R=y`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,T=(v("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${G} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${R} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,v("div")`
  position: absolute;
`,v("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,y`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`);v("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${T} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,v("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,v("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,r=i.createElement,c.p=void 0,f=r,b=void 0,g=void 0,h`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[8910,434,7843,2635],()=>s(18258));module.exports=r})();