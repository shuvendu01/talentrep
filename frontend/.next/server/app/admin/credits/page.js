(()=>{var e={};e.id=8858,e.ids=[8858],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},27790:e=>{"use strict";e.exports=require("assert")},84770:e=>{"use strict";e.exports=require("crypto")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},32694:e=>{"use strict";e.exports=require("http2")},35240:e=>{"use strict";e.exports=require("https")},19801:e=>{"use strict";e.exports=require("os")},55315:e=>{"use strict";e.exports=require("path")},76162:e=>{"use strict";e.exports=require("stream")},74175:e=>{"use strict";e.exports=require("tty")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},7510:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>o.a,__next_app__:()=>p,originalPathname:()=>u,pages:()=>c,routeModule:()=>x,tree:()=>d}),r(37573),r(11887),r(35866);var s=r(23191),a=r(88716),i=r(37922),o=r.n(i),n=r(95231),l={};for(let e in n)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>n[e]);r.d(t,l);let d=["",{children:["admin",{children:["credits",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,37573)),"/app/frontend/src/app/admin/credits/page.js"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,11887)),"/app/frontend/src/app/layout.js"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,35866,23)),"next/dist/client/components/not-found-error"]}],c=["/app/frontend/src/app/admin/credits/page.js"],u="/admin/credits/page",p={require:r,loadChunk:()=>Promise.resolve()},x=new s.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/admin/credits/page",pathname:"/admin/credits",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},25696:(e,t,r)=>{Promise.resolve().then(r.bind(r,10453))},71821:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});let s=(0,r(62881).Z)("dollar-sign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]])},98908:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});let s=(0,r(62881).Z)("gift",[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]])},31215:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});let s=(0,r(62881).Z)("save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]])},17069:(e,t,r)=>{"use strict";r.d(t,{Z:()=>s});let s=(0,r(62881).Z)("trending-up",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]])},10453:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>x});var s=r(10326),a=r(17577),i=r(83630),o=r(24061),n=r(17069),l=r(71821),d=r(98908),c=r(31215),u=r(98866),p=r(40381);function x(){let[e,t]=(0,a.useState)(null),[r,x]=(0,a.useState)(!0),[m,h]=(0,a.useState)(!1),[b,g]=(0,a.useState)({totalUsers:0,totalCreditsIssued:0,totalTransactions:0}),f=async()=>{try{let e=await u.Z.get("/credits/settings");t(e.data),x(!1)}catch(e){console.error("Failed to fetch settings:",e),p.Am.error("Failed to load credit settings"),x(!1)}},v=async()=>{h(!0);try{await u.Z.put("/credits/settings",e),p.Am.success("Credit settings updated successfully"),f()}catch(e){console.error("Failed to save settings:",e),p.Am.error("Failed to update settings")}finally{h(!1)}},y=(e,r)=>{t(t=>({...t,[e]:parseFloat(r)||0}))};return r?s.jsx(i.Z,{children:s.jsx("div",{className:"flex items-center justify-center h-96",children:s.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"})})}):s.jsx(i.Z,{children:(0,s.jsxs)("div",{className:"space-y-6",children:[(0,s.jsxs)("div",{children:[s.jsx("h1",{className:"text-3xl font-bold text-white",children:"Credit Management"}),s.jsx("p",{className:"text-gray-400 mt-2",children:"Configure platform credit costs, bonuses, and earnings"})]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[s.jsx("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6",children:(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{children:[s.jsx("p",{className:"text-gray-400 text-sm",children:"Total Users"}),s.jsx("p",{className:"text-3xl font-bold text-white mt-2",children:b.totalUsers})]}),s.jsx("div",{className:"p-4 bg-blue-500/20 rounded-xl",children:s.jsx(o.Z,{className:"h-8 w-8 text-blue-400"})})]})}),s.jsx("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6",children:(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{children:[s.jsx("p",{className:"text-gray-400 text-sm",children:"Total Transactions"}),s.jsx("p",{className:"text-3xl font-bold text-white mt-2",children:b.totalTransactions})]}),s.jsx("div",{className:"p-4 bg-green-500/20 rounded-xl",children:s.jsx(n.Z,{className:"h-8 w-8 text-green-400"})})]})}),s.jsx("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6",children:(0,s.jsxs)("div",{className:"flex items-center justify-between",children:[(0,s.jsxs)("div",{children:[s.jsx("p",{className:"text-gray-400 text-sm",children:"Credits Issued"}),s.jsx("p",{className:"text-3xl font-bold text-white mt-2",children:b.totalCreditsIssued})]}),s.jsx("div",{className:"p-4 bg-purple-500/20 rounded-xl",children:s.jsx(l.Z,{className:"h-8 w-8 text-purple-400"})})]})})]}),(0,s.jsxs)("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6",children:[(0,s.jsxs)("h2",{className:"text-xl font-bold text-white mb-6 flex items-center gap-2",children:[s.jsx(l.Z,{className:"h-6 w-6 text-blue-400"}),"Credit Costs"]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Contact Reveal Cost"}),s.jsx("input",{type:"number",value:e?.contact_reveal_cost||0,onChange:e=>y("contact_reveal_cost",e.target.value),className:"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"10000"}),s.jsx("p",{className:"text-xs text-gray-400 mt-1",children:"Credits required to reveal job seeker contact"})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Interview Request Cost"}),s.jsx("input",{type:"number",value:e?.interview_request_cost||0,onChange:e=>y("interview_request_cost",e.target.value),className:"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"5000"}),s.jsx("p",{className:"text-xs text-gray-400 mt-1",children:"Credits required to request an interview"})]})]})]}),(0,s.jsxs)("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6",children:[(0,s.jsxs)("h2",{className:"text-xl font-bold text-white mb-6 flex items-center gap-2",children:[s.jsx(n.Z,{className:"h-6 w-6 text-green-400"}),"Credit Earnings"]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Interview Completion Earnings"}),s.jsx("input",{type:"number",value:e?.interview_completion_earnings||0,onChange:e=>y("interview_completion_earnings",e.target.value),className:"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent",placeholder:"500"}),s.jsx("p",{className:"text-xs text-gray-400 mt-1",children:"Credits earned by interviewer per completed interview"})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Referral Bonus"}),s.jsx("input",{type:"number",value:e?.referral_bonus||0,onChange:e=>y("referral_bonus",e.target.value),className:"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent",placeholder:"50"}),s.jsx("p",{className:"text-xs text-gray-400 mt-1",children:"Bonus credits for successful referrals"})]})]})]}),(0,s.jsxs)("div",{className:"bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6",children:[(0,s.jsxs)("h2",{className:"text-xl font-bold text-white mb-6 flex items-center gap-2",children:[s.jsx(d.Z,{className:"h-6 w-6 text-purple-400"}),"Signup Bonuses"]}),(0,s.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Job Seeker Bonus"}),s.jsx("input",{type:"number",value:e?.jobseeker_signup_bonus||0,onChange:e=>y("jobseeker_signup_bonus",e.target.value),className:"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent",placeholder:"200"})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Employer Bonus"}),s.jsx("input",{type:"number",value:e?.employer_signup_bonus||0,onChange:e=>y("employer_signup_bonus",e.target.value),className:"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent",placeholder:"10000"})]}),(0,s.jsxs)("div",{children:[s.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Interviewer Bonus"}),s.jsx("input",{type:"number",value:e?.interviewer_signup_bonus||0,onChange:e=>y("interviewer_signup_bonus",e.target.value),className:"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent",placeholder:"500"})]})]})]}),s.jsx("div",{className:"flex justify-end",children:s.jsx("button",{onClick:v,disabled:m,className:"px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2 disabled:opacity-50",children:m?(0,s.jsxs)(s.Fragment,{children:[s.jsx("div",{className:"animate-spin rounded-full h-5 w-5 border-b-2 border-white"}),"Saving..."]}):(0,s.jsxs)(s.Fragment,{children:[s.jsx(c.Z,{className:"h-5 w-5"}),"Save Settings"]})})})]})})}},37573:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(68570).createProxy)(String.raw`/app/frontend/src/app/admin/credits/page.js#default`)},40381:(e,t,r)=>{"use strict";r.d(t,{Am:()=>F});var s,a=r(17577);let i={data:""},o=e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||i},n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,d=/\n+/g,c=(e,t)=>{let r="",s="",a="";for(let i in e){let o=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+o+";":s+="f"==i[1]?c(o,i):i+"{"+c(o,"k"==i[1]?"":t)+"}":"object"==typeof o?s+=c(o,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=o&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=c.p?c.p(i,o):i+":"+o+";")}return r+(t&&a?t+"{"+a+"}":a)+s},u={},p=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+p(e[r]);return t}return e},x=(e,t,r,s,a)=>{let i=p(e),o=u[i]||(u[i]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(i));if(!u[o]){let t=i!==e?e:(e=>{let t,r,s=[{}];for(;t=n.exec(e.replace(l,""));)t[4]?s.shift():t[3]?(r=t[3].replace(d," ").trim(),s.unshift(s[0][r]=s[0][r]||{})):s[0][t[1]]=t[2].replace(d," ").trim();return s[0]})(e);u[o]=c(a?{["@keyframes "+o]:t}:t,r?"":"."+o)}let x=r&&u.g?u.g:null;return r&&(u.g=u[o]),((e,t,r,s)=>{s?t.data=t.data.replace(s,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(u[o],t,s,x),o},m=(e,t,r)=>e.reduce((e,s,a)=>{let i=t[a];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+s+(null==i?"":i)},"");function h(e){let t=this||{},r=e.call?e(t.p):e;return x(r.unshift?r.raw?m(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,o(t.target),t.g,t.o,t.k)}h.bind({g:1});let b,g,f,v=h.bind({k:1});function y(e,t){let r=this||{};return function(){let s=arguments;function a(i,o){let n=Object.assign({},i),l=n.className||a.className;r.p=Object.assign({theme:g&&g()},n),r.o=/ *go\d+/.test(l),n.className=h.apply(r,s)+(l?" "+l:""),t&&(n.ref=o);let d=e;return e[0]&&(d=n.as||e,delete n.as),f&&d[0]&&f(n),b(d,n)}return t?t(a):a}}var w=e=>"function"==typeof e,j=(e,t)=>w(e)?e(t):e,N=(()=>{let e=0;return()=>(++e).toString()})(),_=((()=>{let e;return()=>e})(),"default"),k=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:s}=t;return k(e,{type:e.toasts.find(e=>e.id===s.id)?1:0,toast:s});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+i}))}}},q=[],C={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},Z={},A=(e,t=_)=>{Z[t]=k(Z[t]||C,e),q.forEach(([e,r])=>{e===t&&r(Z[t])})},P=e=>Object.keys(Z).forEach(t=>A(e,t)),$=e=>Object.keys(Z).find(t=>Z[t].toasts.some(t=>t.id===e)),S=(e=_)=>t=>{A(t,e)},I={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},M=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||N()}),E=e=>(t,r)=>{let s=M(t,e,r);return S(s.toasterId||$(s.id))({type:2,toast:s}),s.id},F=(e,t)=>E("blank")(e,t);F.error=E("error"),F.success=E("success"),F.loading=E("loading"),F.custom=E("custom"),F.dismiss=(e,t)=>{let r={type:3,toastId:e};t?S(t)(r):P(r)},F.dismissAll=e=>F.dismiss(void 0,e),F.remove=(e,t)=>{let r={type:4,toastId:e};t?S(t)(r):P(r)},F.removeAll=e=>F.remove(void 0,e),F.promise=(e,t,r)=>{let s=F.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let a=t.success?j(t.success,e):void 0;return a?F.success(a,{id:s,...r,...null==r?void 0:r.success}):F.dismiss(s),e}).catch(e=>{let a=t.error?j(t.error,e):void 0;a?F.error(a,{id:s,...r,...null==r?void 0:r.error}):F.dismiss(s)}),e};var z=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,O=v`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,T=v`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,B=(y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${z} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${O} 0.15s ease-out forwards;
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
    animation: ${T} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,v`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`),H=(y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${B} 1s linear infinite;
`,v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`),D=v`
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
}`,G=(y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${H} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${D} 0.2s ease-out forwards;
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
`,y("div")`
  position: absolute;
`,y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,v`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`);y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${G} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,y("div")`
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
`,y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,s=a.createElement,c.p=void 0,b=s,g=void 0,f=void 0,h`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[8910,434,7843,3083],()=>r(7510));module.exports=s})();