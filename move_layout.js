const fs = require('fs');
let html = fs.readFileSync('nova.html', 'utf8');

const leftSidebarStart = html.indexOf('<!-- Left Sidebar: Local Info & Astronauts -->');
const leftSidebarEnd = html.indexOf('<!-- Mobile Toggles -->');

const manifestStart = html.indexOf('<!-- Panel Manifest (Above Event Timeline) - Spans Col 1 -->');
const manifestEnd = html.indexOf('<!-- Timeline Slider (Simulasi Siang & Malam)');

const timelineStart = html.indexOf('<!-- Event Timeline Panel - Col 1 -->');
const timelineEnd = html.indexOf('<!-- Telemetry Panel - Col 2 -->');

if (leftSidebarStart === -1 || manifestStart === -1 || timelineStart === -1) {
    console.log("Could not find blocks.");
    process.exit(1);
}

let manifestHtml = html.substring(manifestStart, manifestEnd);
manifestHtml = manifestHtml.replace(/<div class="col-start-[0-9]+ col-span-[0-9]+ h-full w-full">[\s\S]*?<div id="manifest-panel"[\s\S]*?>/, '<div id="manifest-panel"\n                class="glass w-full rounded-xl p-3 pointer-events-auto shadow-2xl flex flex-col shrink-0" style="height: 55%;">');
manifestHtml = manifestHtml.trim().replace(/<\/div>$/, '');

let eventTimelineHtml = html.substring(timelineStart, timelineEnd);
eventTimelineHtml = eventTimelineHtml.replace(/<div class="col-start-[0-9]+ col-span-[0-9]+ h-full w-full">[\s\S]*?<div id="event-timeline-panel"[\s\S]*?>/, '<div id="event-timeline-panel"\n                class="w-full glass rounded-xl p-3 flex flex-col pointer-events-auto shadow-2xl justify-between flex-grow min-h-0">');
eventTimelineHtml = eventTimelineHtml.trim().replace(/<\/div>$/, '');

let existingLeftInner = html.substring(leftSidebarStart, leftSidebarEnd);
existingLeftInner = existingLeftInner.replace(/<!-- Left Sidebar: Local Info & Astronauts -->/, '');
existingLeftInner = existingLeftInner.replace(/<div[\s\S]*?class="fixed top-4 left-4[^"]*"[^>]*>/, '');
existingLeftInner = existingLeftInner.replace(/<\/div>\s*$/, '');

let newLeftSide = `    <!-- Left Side: Two Columns -->
    <div class="fixed top-4 left-4 md:top-4 md:left-4 z-20 pointer-events-none flex gap-3 max-h-[calc(100vh-32px)]">
        
        <!-- Column 1: Info, Astronauts & Weather -->
        <div class="w-64 md:w-72 flex flex-col gap-3 h-fit max-h-full shrink-0">
${existingLeftInner}        </div>

        <!-- Column 2: Manifest & Timeline -->
        <div class="w-64 md:w-[280px] flex flex-col gap-3 h-full shrink-0 hidden md:flex" style="height: calc(100vh - 32px);">
            ${manifestHtml}
            ${eventTimelineHtml}
        </div>
    </div>\n\n`;

html = html.substring(0, leftSidebarStart) + newLeftSide + html.substring(leftSidebarEnd);

html = html.replace(/grid-template-columns: 240px 280px 170px 280px; grid-template-rows: auto 210px;/, 'grid-template-columns: 320px 192px 320px; grid-template-rows: auto 240px;');

const cleanManifestStart = html.indexOf('<!-- Panel Manifest (Above Event Timeline) - Spans Col 1 -->');
const cleanManifestEnd = html.indexOf('<!-- Timeline Slider (Simulasi Siang & Malam)');
if (cleanManifestStart !== -1 && cleanManifestEnd !== -1) {
    html = html.substring(0, cleanManifestStart) + html.substring(cleanManifestEnd);
}

const cleanTimelineStart = html.indexOf('<!-- Event Timeline Panel - Col 1 -->');
const cleanTimelineEnd = html.indexOf('<!-- Telemetry Panel - Col 2 -->');
if (cleanTimelineStart !== -1 && cleanTimelineEnd !== -1) {
    html = html.substring(0, cleanTimelineStart) + html.substring(cleanTimelineEnd);
}

html = html.replace(/<!-- Timeline Slider.*?-->\s*<div class="col-start-[0-9]+ col-span-[0-9]+/, '<!-- Timeline Slider (Simulasi Siang & Malam) - Spans Col 1 & 2 -->\n        <div class="col-start-1 col-span-2');
html = html.replace(/<!-- Controls Panel.*?-->\s*<div class="col-start-[0-9]+ col-span-[0-9]+/, '<!-- Controls Panel (Above Map) - Spans Col 3 -->\n        <div class="col-start-3 col-span-1');
html = html.replace(/<!-- Telemetry Panel.*?-->\s*<div class="col-start-[0-9]+ col-span-[0-9]+/, '<!-- Telemetry Panel - Col 1 -->\n        <div class="col-start-1 col-span-1');
html = html.replace(/<!-- Aktivitas Stasiun Panel.*?-->\s*<div class="col-start-[0-9]+ col-span-[0-9]+/, '<!-- Aktivitas Stasiun Panel - Col 2 -->\n        <div class="col-start-2 col-span-1');
html = html.replace(/<!-- Peta Launch Site Panel.*?-->\s*<div class="col-start-[0-9]+ col-span-[0-9]+/, '<!-- Peta Launch Site Panel - Col 3 -->\n        <div class="col-start-3 col-span-1');

fs.writeFileSync('nova.html', html);
console.log('Layout updated');
