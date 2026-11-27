const previewCopy = {
  en: {tree:'Tree',gallery:'Gallery',blog:'Blog',account:'Account',archive:'Family archive',developed:'Developed by',preview:'Design preview with fictional family records.',privacy:'Privacy Policy',close:'Close',title:'Mirawdali',suggest:'Suggest a correction',photo:'Submit a photo',write:'Write a post',familyTree:'Family tree',treeHint:'Select a person to explore their family connections.',search:'Find a family member',first:'First generation',second:'Second generation',third:'Third generation',totals:'8 people across 3 generations',drag:'Scroll sideways to explore the tree.',born:'Born',male:'Male',female:'Female',partners:'Partner',children:'Children',parent:'Parents',none:'No sample details',galleryHint:'A collection of photographs and family memories.',blogHint:'Stories shared by the family.',dark:'Switch to dark mode',light:'Switch to light mode',signIn:'Sign in or create an account',signNote:'This is a mockup. Use the demo account to explore submissions.',password:'Email and password',google:'Continue with Google',demo:'Try demo account',signOut:'Exit demo account',signed:'Demo contributor',admin:'Preview admin review',queue:'Review queue',empty:'There are no pending demo submissions.',approve:'Approve',reject:'Reject',approved:'Demo submission approved.',rejected:'Demo submission rejected.',details:'Details',subject:'Title or family member',selectFile:'Choose photo',send:'Submit for review',sent:'Demo submission sent for review.',policy:'Privacy policy preview',policyText:'The launch plan makes approved family records, photos, and posts publicly viewable. Only the birth year of living members is shown publicly when available. Contributions require an account and go to the admin for review.',policyDemo:'This mockup uses fictional records and does not collect account information.',photoCredit:'Illustrative archive photo',noResults:'No matching family members.'},
  ckb: {tree:'شەجەری خێزانی',gallery:'گالەری',blog:'بلۆگ',account:'هەژمار',archive:'ئەرشیفی بنەماڵە',developed:'گەشەپێدراوە لەلایەن',preview:'پێشبینینی دیزاین بە زانیاریی خەیاڵی.',privacy:'سیاسەتی تایبەتمەندی',close:'داخستن',title:'میراودەلی',suggest:'پێشنیاری ڕاستکردنەوە',photo:'ناردنی وێنە',write:'نووسینی بابەت',familyTree:'شەجەری خێزانی',treeHint:'کەسێک هەڵبژێرە بۆ بینینی پەیوەندییە خێزانییەکانی.',search:'گەڕان بەدوای ئەندامێکدا',first:'نەوەی یەکەم',second:'نەوەی دووەم',third:'نەوەی سێیەم',totals:'٨ کەس لە ٣ نەوەدا',drag:'بۆ بینینی هەموو شەجەرەکە بەرەو لا بڕۆ.',born:'لەدایکبوون',male:'نێر',female:'مێ',partners:'هاوسەر',children:'منداڵەکان',parent:'دایک و باوک',none:'زانیاریی نموونە نییە',galleryHint:'کۆمەڵە وێنە و یادەوەریی بنەماڵە.',blogHint:'چیرۆکەکانی ئەندامانی بنەماڵە.',dark:'چوونە دۆخی تاریک',light:'چوونە دۆخی ڕووناک',signIn:'چوونەژوورەوە یان دروستکردنی هەژمار',signNote:'ئەمە نموونەیە. بە هەژماری تاقیکردنەوە ناردنی پێشنیار تاقی بکەرەوە.',password:'ئیمەیڵ و وشەی نهێنی',google:'بەردەوامبوون لەگەڵ گووگڵ',demo:'تاقیکردنەوەی هەژماری نموونە',signOut:'دەرچوون لە هەژماری نموونە',signed:'هەژماری نموونە',admin:'پێشبینینی پێداچوونەوەی بەڕێوەبەر',queue:'پێداچوونەوە',empty:'هیچ داواکارییەک چاوەڕوان نییە.',approve:'پەسەندکردن',reject:'ڕەتکردنەوە',approved:'نموونەکە پەسەند کرا.',rejected:'نموونەکە ڕەت کرایەوە.',details:'وردەکاری',subject:'ناونیشان یان ناوی ئەندام',selectFile:'هەڵبژاردنی وێنە',send:'ناردن بۆ پێداچوونەوە',sent:'نموونەکە بۆ پێداچوونەوە نێردرا.',policy:'نموونەی سیاسەتی تایبەتمەندی',policyText:'زانیارییە پەسەندکراوەکانی بنەماڵە و وێنە و بابەتەکان بۆ هەمووان دەردەکەون. بۆ ئەندامانی لە ژیاندا تەنها ساڵی لەدایکبوون پیشان دەدرێت، ئەگەر هەبێت. ناردن پێویستی بە هەژمار هەیە و بەڕێوەبەر پێداچوونەوە دەکات.',policyDemo:'ئەم نموونەیە زانیاریی خەیاڵی بەکار دەهێنێت و زانیاریی هەژمار کۆ ناکاتەوە.',photoCredit:'وێنەی نموونە',noResults:'هیچ ئەندامێک نەدۆزرایەوە.'}
};
Object.assign(previewCopy.en, {hide:'Collapse descendants of',show:'Expand descendants of',all:'All',memories:'Family memories',history:'Family history',news:'Family updates',filter:'Blog categories',category:'Category',noPosts:'No posts in this category yet.',archiveLandscape:'Mountain village',searchCount:'Matching members'});
Object.assign(previewCopy.ckb, {hide:'شاردنەوەی نەوەکانی',show:'پیشاندانی نەوەکانی',all:'هەموو',memories:'یادەوەرییەکانی بنەماڵە',history:'مێژووی بنەماڵە',news:'هەواڵی بنەماڵە',filter:'بەشەکانی بلۆگ',category:'بەش',noPosts:'هێشتا هیچ بابەتێک لەم بەشەدا نییە.',archiveLandscape:'گوندێکی چیاکان',searchCount:'ئەندامانی دۆزراوە'});

const production = {
  en: {login:'Sign in', signup:'Create account', reset:'Reset password', newPassword:'Set new password', email:'Email', secret:'Password', google:'Continue with Google', back:'Back', logout:'Sign out', status:'My submissions', manage:'Manage archive', addMember:'Add family member', editMember:'Edit family member', noMembers:'The family tree is ready for its first member.', noPhotos:'Approved photos will appear here.', setup:'The archive is being set up.', loadError:'The archive could not be loaded. Please try again shortly.', privateArchive:'Sign in to browse this family archive.', post:'Blog post', photo:'Gallery photo', suggestion:'Tree suggestion', pending:'Pending review', approved:'Approved', rejected:'Rejected', invalid:'Check the fields and try again.', invalidPhoto:'Choose a JPEG, PNG, or WebP image under 3 MB.', invalidRelationship:'Check the years and relationships. A member cannot be their own ancestor or partner.', unavailable:'Account services are being set up.', authError:'That account action could not be completed. Check your details and try again.', verifyEmail:'Check your email for a confirmation link.', resetSent:'If an account exists for that address, a password reset link will arrive by email.', passwordUpdated:'Password updated.', signedIn:'Signed in.', signedOut:'Signed out.', signInFirst:'Sign in to continue.', adminOnly:'This action requires the archive administrator.', saveFailed:'Your changes could not be saved. Please try again.', submitted:'Submitted for admin review.', memberSaved:'Family member saved.', reviewed:'Review saved.', alreadyReviewed:'This submission has already been reviewed.', visibilitySaved:'Browsing access updated.', englishName:'Name in English', soraniName:'Name in Sorani', gender:'Gender', birthYear:'Birth year', deathYear:'Death year', partnerField:'Partners', other:'Other', unspecified:'Unspecified', optional:'Optional', member:'Family member', save:'Save', photoLimit:'JPEG, PNG, or WebP, up to 3 MB.', visibility:'Browsing access', everyone:'Public', membersOnly:'Signed-in users only', signInToWrite:'Sign in to contribute', branchHint:'Use + and − to show or hide descendants.', relationshipsHint:'Select all parents or partners that apply.', noSubmissions:'Your submissions will appear here.', adminHint:'Approve posts and photos for publication. Apply accepted tree suggestions using the member editor.', privacyBody:'Mirawdali uses your email address to manage sign-in. The site stores the posts, photos, and tree suggestions you submit so the administrator can review them. Approved blog posts and gallery photos are visible to the archive’s current audience. Only birth years may be shown in the tree. Please share information and images you have permission to publish. The site remembers your language and theme in this browser. To request a correction or removal, contact the administrator using the tree suggestion form, or reach out to the family archive administrator directly.', memberTotal:'Family members', noMatches:'No matching family members.', familyTree:'Family tree', postTitle:'Title', description:'Caption', related:'Related family member', title:'Mirawdali', addPhoto:'Member photo', deceased:'Died'},
  ckb: {login:'چوونەژوورەوە', signup:'دروستکردنی هەژمار', reset:'گۆڕینی وشەی نهێنی', newPassword:'دانانی وشەی نهێنی نوێ', email:'ئیمەیڵ', secret:'وشەی نهێنی', google:'بەردەوامبوون لەگەڵ گووگڵ', back:'گەڕانەوە', logout:'دەرچوون', status:'نێردراوەکانم', manage:'بەڕێوەبردنی ئەرشیف', addMember:'زیادکردنی ئەندامی بنەماڵە', editMember:'دەستکاریکردنی ئەندام', noMembers:'شەجەرەکە ئامادەیە بۆ زیادکردنی یەکەم ئەندام.', noPhotos:'وێنە پەسەندکراوەکان لێرە دەردەکەون.', setup:'ئەرشیفەکە ئامادە دەکرێت.', loadError:'ئەرشیفەکە بار نەبوو. تکایە دووبارە هەوڵ بدەوە.', privateArchive:'بچۆ ژوورەوە بۆ بینینی ئەرشیفی بنەماڵە.', post:'بابەتی بلۆگ', photo:'وێنەی گالەری', suggestion:'پێشنیاری شەجەرە', pending:'چاوەڕوانی پێداچوونەوە', approved:'پەسەندکراو', rejected:'ڕەتکراوە', invalid:'خانەکان بپشکنە و دووبارە هەوڵ بدەوە.', invalidPhoto:'وێنەی JPEG، PNG یان WebP هەڵبژێرە بە قەبارەی کەمتر لە ٣ مێگابایت.', invalidRelationship:'ساڵ و پەیوەندییەکان بپشکنە. ئەندام نابێت باپیر یان هاوسەری خۆی بێت.', unavailable:'خزمەتگوزارییەکانی هەژمار ئامادە دەکرێن.', authError:'کردارەکە سەرکەوتوو نەبوو. زانیارییەکان بپشکنە و دووبارە هەوڵ بدەوە.', verifyEmail:'ئیمەیڵەکەت بپشکنە بۆ بەستەری پشتڕاستکردنەوە.', resetSent:'ئەگەر هەژمارێک بەو ئیمەیڵە هەبێت، بەستەری گۆڕینی وشەی نهێنی بۆت دەنێردرێت.', passwordUpdated:'وشەی نهێنی نوێ کرایەوە.', signedIn:'چوویتە ژوورەوە.', signedOut:'چوویتە دەرەوە.', signInFirst:'بچۆ ژوورەوە بۆ بەردەوامبوون.', adminOnly:'ئەم کردارە تەنها بۆ بەڕێوەبەرە.', saveFailed:'گۆڕانکارییەکان پاشەکەوت نەکران. تکایە دووبارە هەوڵ بدەوە.', submitted:'بۆ پێداچوونەوە نێردرا.', memberSaved:'ئەندامی بنەماڵە پاشەکەوت کرا.', reviewed:'پێداچوونەوە پاشەکەوت کرا.', alreadyReviewed:'پێشتر پێداچوونەوەی بۆ کراوە.', visibilitySaved:'ڕێگەپێدانی بینین نوێ کرایەوە.', englishName:'ناو بە ئینگلیزی', soraniName:'ناو بە کوردی', gender:'ڕەگەز', birthYear:'ساڵی لەدایکبوون', deathYear:'ساڵی کۆچی دوایی', partnerField:'هاوسەرەکان', other:'هی تر', unspecified:'دیاری نەکراوە', optional:'ئارەزوومەندانە', member:'ئەندامی بنەماڵە', save:'پاشەکەوتکردن', photoLimit:'JPEG، PNG یان WebP، تا ٣ مێگابایت.', visibility:'ڕێگەپێدانی بینین', everyone:'گشتی', membersOnly:'تەنها بە هەژمار', signInToWrite:'بچۆ ژوورەوە بۆ بەشداریکردن', branchHint:'بە + و − نەوەکان پیشان بدە یان بیشارەوە.', relationshipsHint:'هەموو دایک و باوک یان هاوسەرە پەیوەندیدارەکان هەڵبژێرە.', noSubmissions:'نێردراوەکانت لێرە دەردەکەون.', adminHint:'بابەت و وێنەکان بۆ بڵاوکردنەوە پەسەند بکە. پێشنیارە پەسەندکراوەکان لە دەستکاری ئەندام جێبەجێ بکە.', privacyBody:'میراودەلی ئیمەیڵەکەت بۆ چوونەژوورەوە بەکاردەهێنێت. بابەت و وێنە و پێشنیارەکانت هەڵدەگیرێن بۆ پێداچوونەوەی بەڕێوەبەر. بابەت و وێنە پەسەندکراوەکان بە پێی ڕێگەپێدانی بینینی ئەرشیف دەردەکەون. لە شەجەرەکە تەنها ساڵی لەدایکبوون پیشان دەدرێت. تەنها ئەو زانیاری و وێنانە بنێرە کە ڕێگەی بڵاوکردنەوەت هەیە. هەڵبژاردنی زمان و ڕەنگ لە وێبگەڕەکەتدا هەڵدەگیرێت. بۆ ڕاستکردنەوە یان لابردنی زانیاری، لە ڕێی فۆڕمی پێشنیارەوە یان ڕاستەوخۆ پەیوەندی بە بەڕێوەبەرەوە بکە.', memberTotal:'ئەندامانی بنەماڵە', noMatches:'هیچ ئەندامێک نەدۆزرایەوە.', familyTree:'شەجەری خێزانی', postTitle:'ناونیشان', description:'وەسفی وێنە', related:'ئەندامی پەیوەندیدار', title:'میراودەلی', addPhoto:'وێنەی ئەندام', deceased:'کۆچی دوایی'}
};
export type Language = 'en' | 'ckb';
export type Translate = (key: string) => string;
export function translate(lang: Language): Translate {
  const words: Record<string,string> = {...previewCopy[lang], ...production[lang]};
  return key => words[key] ?? key;
}

Object.assign(production.en, {submitPhoto:"Submit a photo",empty:"No submissions are waiting for review.",none:"None",acceptedSuggestions:"Approved tree suggestions"});
Object.assign(production.ckb, {submitPhoto:"ناردنی وێنە",empty:"هیچ نێردراوێک چاوەڕوان نییە.",none:"هیچ",acceptedSuggestions:"پێشنیارە پەسەندکراوەکانی شەجەرە"});

Object.assign(production.en, {
  manage:"Admin panel", adminTitle:"Admin panel", backToSite:"Back to site", overview:"Overview", users:"Users", settings:"Settings",
  owner:"Owner", yourAccess:"Your access", fullAccess:"Full access", membersCount:"Family members", pendingCount:"Waiting for review",
  publishedCount:"Published", usersCount:"Accounts", addPost:"Add post", addGalleryPhoto:"Add photo", edit:"Edit", delete:"Delete",
  publish:"Publish", unpublish:"Unpublish", moveToPending:"Move to pending", statusAll:"All", statusPending:"Pending",
  statusPublished:"Published", statusRejected:"Rejected", submittedBy:"By", unknownAuthor:"Deleted account", treeSuggestions:"Tree suggestions",
  applyToTree:"Apply to tree", markDone:"Mark as done", applied:"Applied", noEntries:"Nothing here yet.", noSuggestions:"No tree suggestions.",
  confirmDelete:"Delete this permanently? This cannot be undone.", confirmDeleteMember:"Delete this family member? Their parent, child and partner links will also be removed.",
  confirmDeleteUser:"Delete this account and everything it submitted? This cannot be undone.", confirmBlock:"Block this account? It will be signed out, lose any admin roles and be unable to sign in.",
  joined:"Joined", lastSignIn:"Last sign-in", never:"Never", unconfirmed:"Email not confirmed", blocked:"Blocked", block:"Block", unblock:"Unblock",
  adminOf:"Admin of", saveRoles:"Save roles", you:"You", submissionsCount:"Submissions", years:"Years", actions:"Actions", editEntry:"Edit entry",
  ownerNote:"The owner has full access to every section, the users list and settings.",
  rolesNote:"Section admins can add, edit, publish and delete everything in the sections ticked for them, and review what relatives submit there.",
  visibilityHint:"Choose who can browse the tree, gallery and blog.", treeAdminHint:"Approve suggestions, then apply them to the tree or mark them as done.",
  memberDeleted:"Family member deleted.", suggestionDone:"Suggestion marked as done.", entryPublished:"Published.", entrySaved:"Changes saved.",
  statusSaved:"Status updated.", entryDeleted:"Deleted.", rolesSaved:"Roles updated.", userBlocked:"Account blocked.", userUnblocked:"Account unblocked.",
  userDeleted:"Account deleted.", ownerOnly:"Only the owner can do this.", notFound:"That item no longer exists.",
  adminOnly:"You don't have permission to manage this section.", noRelatives:"Add more family members to link parents and partners.",
});
Object.assign(production.ckb, {
  manage:"پانێڵی بەڕێوەبردن", adminTitle:"پانێڵی بەڕێوەبردن", backToSite:"گەڕانەوە بۆ ماڵپەڕ", overview:"پوختە", users:"بەکارهێنەران", settings:"ڕێکخستنەکان",
  owner:"خاوەن", yourAccess:"دەسەڵاتەکانت", fullAccess:"دەسەڵاتی تەواو", membersCount:"ئەندامانی بنەماڵە", pendingCount:"چاوەڕوانی پێداچوونەوە",
  publishedCount:"بڵاوکراوە", usersCount:"هەژمارەکان", addPost:"زیادکردنی بابەت", addGalleryPhoto:"زیادکردنی وێنە", edit:"دەستکاری", delete:"سڕینەوە",
  publish:"بڵاوکردنەوە", unpublish:"لابردن لە بڵاوکردنەوە", moveToPending:"گەڕاندنەوە بۆ چاوەڕوان", statusAll:"هەموو", statusPending:"چاوەڕوان",
  statusPublished:"بڵاوکراوە", statusRejected:"ڕەتکراوە", submittedBy:"لەلایەن", unknownAuthor:"هەژماری سڕاوە", treeSuggestions:"پێشنیارەکانی شەجەرە",
  applyToTree:"جێبەجێکردن لە شەجەرە", markDone:"وەک تەواوبوو دیاری بکە", applied:"جێبەجێکراوە", noEntries:"هێشتا هیچ شتێک نییە.", noSuggestions:"هیچ پێشنیارێک نییە.",
  confirmDelete:"بە یەکجاری بیسڕیتەوە؟ ناگەڕێتەوە.", confirmDeleteMember:"ئەم ئەندامە بسڕیتەوە؟ پەیوەندییەکانی دایک و باوک و منداڵ و هاوسەریشی لادەبرێن.",
  confirmDeleteUser:"ئەم هەژمارە و هەموو نێردراوەکانی بسڕیتەوە؟ ناگەڕێتەوە.", confirmBlock:"ئەم هەژمارە ڕابگریت؟ دەکرێتە دەرەوە، دەسەڵاتەکانی لادەبرێن و ناتوانێت بچێتە ژوورەوە.",
  joined:"بەشداربوون", lastSignIn:"دوایین چوونەژوورەوە", never:"هەرگیز", unconfirmed:"ئیمەیڵ پشتڕاست نەکراوەتەوە", blocked:"ڕاگیراو", block:"ڕاگرتن", unblock:"لابردنی ڕاگرتن",
  adminOf:"بەڕێوەبەری", saveRoles:"پاشەکەوتکردنی دەسەڵاتەکان", you:"تۆ", submissionsCount:"نێردراوەکان", years:"ساڵەکان", actions:"کردارەکان", editEntry:"دەستکاریکردن",
  ownerNote:"خاوەن دەسەڵاتی تەواوی هەیە بەسەر هەموو بەشەکان، بەکارهێنەران و ڕێکخستنەکاندا.",
  rolesNote:"بەڕێوەبەری بەش دەتوانێت لەو بەشانەی بۆی دیاریکراون هەموو شتێک زیاد بکات، دەستکاری بکات، بڵاوی بکاتەوە و بیسڕێتەوە، و پێداچوونەوە بە نێردراوەکاندا بکات.",
  visibilityHint:"دیاری بکە کێ دەتوانێت شەجەرە و گالەری و بلۆگ ببینێت.", treeAdminHint:"پێشنیارەکان پەسەند بکە، پاشان لە شەجەرەکە جێبەجێیان بکە یان وەک تەواوبوو دیارییان بکە.",
  memberDeleted:"ئەندامەکە سڕایەوە.", suggestionDone:"پێشنیارەکە وەک تەواوبوو دیاری کرا.", entryPublished:"بڵاوکرایەوە.", entrySaved:"گۆڕانکارییەکان پاشەکەوت کران.",
  statusSaved:"دۆخەکە نوێ کرایەوە.", entryDeleted:"سڕایەوە.", rolesSaved:"دەسەڵاتەکان نوێ کرانەوە.", userBlocked:"هەژمارەکە ڕاگیرا.", userUnblocked:"ڕاگرتنی هەژمارەکە لابرا.",
  userDeleted:"هەژمارەکە سڕایەوە.", ownerOnly:"تەنها خاوەن دەتوانێت ئەمە بکات.", notFound:"ئەم بابەتە چیتر بوونی نییە.",
  adminOnly:"دەسەڵاتی بەڕێوەبردنی ئەم بەشەت نییە.", noRelatives:"ئەندامی زیاتر زیاد بکە بۆ بەستنەوەی دایک و باوک و هاوسەر.",
});

Object.assign(production.en, {profile:"Profile", firstName:"First name", profilePhoto:"Profile photo", removePhoto:"Remove current photo", profileSaved:"Profile saved."});
Object.assign(production.ckb, {profile:"پرۆفایل", firstName:"ناوی یەکەم", profilePhoto:"وێنەی پرۆفایل", removePhoto:"لابردنی وێنەی ئێستا", profileSaved:"پرۆفایل پاشەکەوت کرا."});

Object.assign(production.en, {home:"Home", welcome:"Welcome to the family archive", homeIntro:"Explore the family tree, look through old photographs and read stories shared by relatives.", membersCount:"Family members", photosCount:"Photos", postsCount:"Stories", latestPhotos:"Latest photos", latestPosts:"Latest stories", seeAll:"See all"});
Object.assign(production.ckb, {home:"سەرەکی", welcome:"بەخێربێن بۆ ئەرشیفی بنەماڵە", homeIntro:"شەجەرەی خێزان ببینە، سەیری وێنە کۆنەکان بکە و ئەو چیرۆکانە بخوێنەوە کە خزمەکان هاوبەشیان کردووە.", membersCount:"ئەندامانی بنەماڵە", photosCount:"وێنەکان", postsCount:"چیرۆکەکان", latestPhotos:"دوایین وێنەکان", latestPosts:"دوایین چیرۆکەکان", seeAll:"هەمووی ببینە"});

Object.assign(production.en, {add:"Add", remove:"Remove", zoom:"Zoom", zoomIn:"Zoom in", zoomOut:"Zoom out", cropHint:"Drag to move the photo. Pinch, scroll or use the slider to zoom.", cancelPhoto:"Don't use this photo"});
Object.assign(production.ckb, {add:"زیادکردن", remove:"لابردن", zoom:"گەورەکردن", zoomIn:"گەورەکردن", zoomOut:"بچووککردنەوە", cropHint:"وێنەکە ڕابکێشە بۆ جووڵاندنی. بۆ گەورە و بچووککردن دوو پەنجە یان سلایدەرەکە بەکاربهێنە.", cancelPhoto:"ئەم وێنەیە بەکار مەهێنە"});

Object.assign(production.en, {
  aboutEyebrow:"About the tribe", aboutTitle:"The Mirawdali tribe",
  aboutBody:"Mirawdali — also written Mirawdale, Mirawdeli or Mirawdaly, and known as Agha, Pizhdar or Pishdar — is a Kurdish tribe of Iraqi Kurdistan. It is estimated at more than 15,000 families, living mainly in the Pshdar area of the Kurdistan Region, with some near the border with Iran.",
  familiesValue:"15,000+", familiesStat:"Families, estimated",
  purposeEyebrow:"Why this archive", purposeTitle:"Keeping our names, faces and stories",
  purposeBody:"Family history lives in the memories of our elders and in old photographs scattered across many homes. This archive brings it together in one place — a family tree, a photo gallery and a collection of stories — so it can be shared today and kept for the generations to come.",
  pillarTree:"Every generation, connected", pillarGallery:"Faces and places from the past", pillarStories:"Memories told by the family",
  treeTitle:"See how we are connected", treeBody:"A glimpse of the family tree. Open the full tree to search for any relative and follow every branch.",
  exploreTree:"Explore the full tree", sampleGrandparents:"Grandparents", sampleParents:"Parents", sampleChildren:"Children",
  photosEyebrow:"From the gallery", photosTitle:"Photographs from the family", viewGallery:"View the gallery",
  previousPhoto:"Previous photo", nextPhoto:"Next photo", goToPhoto:"Go to photo",
  storiesEyebrow:"From the blog", storiesTitle:"Latest stories and articles", readBlog:"Read the blog", readMore:"Read",
  howEyebrow:"How it works", howTitle:"An archive we build together",
  step1Title:"Explore", step1Body:"Browse the family tree, the photographs and the stories.",
  step2Title:"Create an account", step2Body:"Sign up with your email address. It only takes a minute.",
  step3Title:"Contribute", step3Body:"Suggest a correction to the tree, send an old photograph, or write down a family story.",
  step4Title:"Reviewed and published", step4Body:"The archive's editors check every submission before it is added, so the record stays accurate.",
  collabEyebrow:"Join in", collabTitle:"This is a collaborative work",
  collabBody:"Every name, date and photograph here was shared by relatives like you. If someone is missing, a date is wrong, or you have a photo or a story to share, add it — the archive grows with every contribution.",
});
Object.assign(production.ckb, {
  aboutEyebrow:"دەربارەی هۆز", aboutTitle:"هۆزی میراودەلی",
  aboutBody:"میراودەلی، کە بە ئاغا و پشدەریش ناسراوە، هۆزێکی کوردە لە کوردستانی عێراق. ژمارەی خێزانەکانی بە زیاتر لە ١٥٬٠٠٠ خێزان مەزەندە دەکرێت، زۆربەیان لە ناوچەی پشدەری هەرێمی کوردستان دەژین و هەندێکیشیان نزیک سنووری ئێران.",
  familiesValue:"+١٥٬٠٠٠", familiesStat:"خێزان، بە مەزەندە",
  purposeEyebrow:"بۆچی ئەم ئەرشیفە", purposeTitle:"پاراستنی ناو و ڕوخسار و چیرۆکەکانمان",
  purposeBody:"مێژووی بنەماڵە لە یادەوەریی گەورەکانمان و لە وێنە کۆنەکانی ناو ماڵە جیاوازەکاندا دەژی. ئەم ئەرشیفە هەمووی لە یەک شوێندا کۆدەکاتەوە — شەجەرەی خێزان، گالەریی وێنە و کۆمەڵێک چیرۆک — بۆ ئەوەی ئەمڕۆ هاوبەش بکرێت و بۆ نەوەکانی داهاتوو بپارێزرێت.",
  pillarTree:"هەموو نەوەکان، بەیەکەوە بەستراو", pillarGallery:"ڕوخسار و شوێنەکانی ڕابردوو", pillarStories:"یادەوەرییەکان بە زمانی بنەماڵە",
  treeTitle:"ببینە چۆن بەیەکەوە بەستراوین", treeBody:"سەیرێکی کورتی شەجەرەکە. شەجەرەی تەواو بکەرەوە بۆ گەڕان بەدوای هەر خزمێکدا و شوێنکەوتنی هەموو لقێک.",
  exploreTree:"بینینی شەجەرەی تەواو", sampleGrandparents:"باپیران", sampleParents:"دایک و باوک", sampleChildren:"منداڵان",
  photosEyebrow:"لە گالەرییەوە", photosTitle:"وێنەکانی بنەماڵە", viewGallery:"بینینی گالەری",
  previousPhoto:"وێنەی پێشوو", nextPhoto:"وێنەی دواتر", goToPhoto:"چوون بۆ وێنەی",
  storiesEyebrow:"لە بلۆگەوە", storiesTitle:"دوایین چیرۆک و بابەتەکان", readBlog:"خوێندنەوەی بلۆگ", readMore:"خوێندنەوە",
  howEyebrow:"چۆن کار دەکات", howTitle:"ئەرشیفێک کە بەیەکەوە دروستی دەکەین",
  step1Title:"بگەڕێ", step1Body:"شەجەرەی خێزان و وێنە و چیرۆکەکان ببینە.",
  step2Title:"هەژمارێک دروست بکە", step2Body:"بە ئیمەیڵەکەت خۆت تۆمار بکە. تەنها یەک خولەک دەخایەنێت.",
  step3Title:"بەشداری بکە", step3Body:"پێشنیاری ڕاستکردنەوەی شەجەرەکە بکە، وێنەیەکی کۆن بنێرە، یان چیرۆکێکی بنەماڵە بنووسە.",
  step4Title:"پێداچوونەوە و بڵاوکردنەوە", step4Body:"بەڕێوەبەرانی ئەرشیف پێش زیادکردن پێداچوونەوە بە هەموو نێردراوێکدا دەکەن، بۆ ئەوەی زانیارییەکان ورد بمێننەوە.",
  collabEyebrow:"بەشدار بە", collabTitle:"ئەمە کارێکی هاوبەشە",
  collabBody:"هەموو ناو و ڕێکەوت و وێنەیەکی ئێرە لەلایەن خزمانی وەک تۆوە هاوبەش کراوە. ئەگەر کەسێک ون بوو، ڕێکەوتێک هەڵە بوو، یان وێنە یان چیرۆکێکت هەیە، زیادی بکە — ئەرشیفەکە بە هەر بەشدارییەک گەورەتر دەبێت.",
});


Object.assign(production.en, {
  howTo:"How to", howto:"How to", backHome:"Back to home", aboutSaved:"Home page text saved.",
  aboutAdminHint:"This paragraph opens the home page. Leave a box empty to show the built-in text, shown faintly inside it.",
  aboutEnglish:"English text", aboutSorani:"Sorani text",
  howtoTitle:"How to use the archive", howtoIntro:"Short guides to finding your family, joining the archive and sharing what you know. Pick a topic below.",
  guide_browse:"Find someone in the family tree", guide_browse_intro:"Anyone can browse the tree, no account needed.",
  guide_browse_1:"Open the Tree tab at the top of the page, or in the bar at the bottom on a phone.",
  guide_browse_2:"Type a name in the search box. Matching people are highlighted and their branch opens.",
  guide_browse_3:"Use + and − under a person to show or hide their descendants.",
  guide_browse_4:"Tap a person to see their years, parents, children and partners.",
  guide_account:"Create an account or sign in", guide_account_intro:"An account lets you contribute and follow your submissions.",
  guide_account_1:"Tap Sign in at the top of the page, then Create account.",
  guide_account_2:"Enter your first name, email address and a password of at least 8 characters.",
  guide_account_3:"Open the confirmation email and tap its link. You'll come back to the site signed in.",
  guide_account_4:"Forgot your password? On the sign-in form, tap Reset password and follow the emailed link.",
  guide_correct:"Suggest a correction to the tree", guide_correct_intro:"Someone missing, a wrong year, a mixed-up parent? Tell us.",
  guide_correct_1:"Sign in, then open the Tree tab.",
  guide_correct_2:"Tap the person concerned and choose Suggest a correction — or use the button on the tree page for someone not yet listed.",
  guide_correct_3:"Write what should change and, if you can, how you know.",
  guide_correct_4:"An editor reviews it and updates the tree. You can see its status under My submissions.",
  guide_photo:"Share a photo", guide_photo_intro:"Old family photographs are some of the most precious things in the archive.",
  guide_photo_1:"Sign in, open the Gallery tab and tap Submit a photo.",
  guide_photo_2:"Choose a JPEG, PNG or WebP image up to 3 MB. A phone photo of a printed picture works well.",
  guide_photo_3:"Give it a title and a caption: who is in it, where and roughly when.",
  guide_photo_4:"After an editor approves it, it appears in the gallery for the family to see.",
  guide_story:"Write a story or article", guide_story_intro:"Memories, history and family news all belong here.",
  guide_story_1:"Sign in, open the Blog tab and tap Write a post.",
  guide_story_2:"Choose a category: family memories, family history or family updates.",
  guide_story_3:"Write in English or Sorani — or both — and send it for review.",
  guide_story_4:"Once approved, it is published on the blog and on the home page.",
  guide_track:"Follow your submissions", guide_track_intro:"Everything you send is reviewed before it is published.",
  guide_track_1:"Tap your name at the top of the page and choose My submissions.",
  guide_track_2:"Each item shows whether it is pending review, approved or rejected.",
  guide_track_3:"If something was rejected and you think it should be included, send it again with more detail.",
  guide_profile:"Set your name and photo", guide_profile_intro:"Your first name and photo appear in the top corner when you are signed in.",
  guide_profile_1:"Tap your name at the top of the page and choose Profile.",
  guide_profile_2:"Change your first name, or choose a photo and drag and zoom it to fit the circle.",
  guide_profile_3:"Tap Save. The change shows on all your devices.",
  guide_install:"Add the archive to your phone", guide_install_intro:"Open it like an app, straight from your home screen.",
  guide_install_1:"iPhone: open the site in Safari, tap Share, then Add to Home Screen.",
  guide_install_2:"Android: open the site in Chrome, tap the ⋮ menu, then Add to Home screen or Install app.",
  guide_install_3:"The Mirawdali icon then appears with your other apps.",
  guide_help:"Need help?", guide_help_intro:"If something doesn't work or you have a question, send it through Suggest a correction on the tree, and the archive's editors will get back to you.",
});
Object.assign(production.ckb, {
  howTo:"ڕێنمایی", howto:"ڕێنمایی", backHome:"گەڕانەوە بۆ سەرەکی", aboutSaved:"دەقی پەڕەی سەرەکی پاشەکەوت کرا.",
  aboutAdminHint:"ئەم بڕگەیە پەڕەی سەرەکی دەست پێدەکات. ئەگەر خانەیەک بەتاڵ بێت، دەقە بنەڕەتییەکە پیشان دەدرێت کە بە کاڵی تێیدا دیارە.",
  aboutEnglish:"دەقی ئینگلیزی", aboutSorani:"دەقی کوردی",
  howtoTitle:"چۆن ئەرشیفەکە بەکاربهێنیت", howtoIntro:"ڕێنمایی کورت بۆ دۆزینەوەی بنەماڵەکەت، بەشداربوون لە ئەرشیفەکە و هاوبەشکردنی ئەوەی دەیزانیت. بابەتێک هەڵبژێرە.",
  guide_browse:"دۆزینەوەی کەسێک لە شەجەرەکەدا", guide_browse_intro:"هەموو کەسێک دەتوانێت سەیری شەجەرەکە بکات، پێویستی بە هەژمار نییە.",
  guide_browse_1:"بەشی شەجەرە لە سەرەوەی پەڕەکە بکەرەوە، یان لە شریتی خوارەوە لە مۆبایلدا.",
  guide_browse_2:"ناوێک لە خانەی گەڕاندا بنووسە. کەسە گونجاوەکان دیار دەکرێن و لقەکەیان دەکرێتەوە.",
  guide_browse_3:"بە + و − لە ژێر هەر کەسێکەوە نەوەکانی پیشان بدە یان بیانشارەوە.",
  guide_browse_4:"لە سەر کەسێک بدە بۆ بینینی ساڵەکان، دایک و باوک، منداڵ و هاوسەرەکانی.",
  guide_account:"دروستکردنی هەژمار یان چوونەژوورەوە", guide_account_intro:"هەژمار ڕێگەت پێدەدات بەشداری بکەیت و نێردراوەکانت ببینیت.",
  guide_account_1:"لە سەرەوەی پەڕەکە لە سەر چوونەژوورەوە بدە، پاشان دروستکردنی هەژمار.",
  guide_account_2:"ناوی یەکەم، ئیمەیڵ و وشەی نهێنییەکی لانیکەم ٨ پیت بنووسە.",
  guide_account_3:"ئیمەیڵی پشتڕاستکردنەوەکە بکەرەوە و لە سەر بەستەرەکە بدە. بە چوونەژوورەوە دەگەڕێیتەوە بۆ ماڵپەڕەکە.",
  guide_account_4:"وشەی نهێنیت لەبیرچووە؟ لە فۆڕمی چوونەژوورەوە لە سەر گۆڕینی وشەی نهێنی بدە و بەستەری ئیمەیڵەکە بەکاربهێنە.",
  guide_correct:"پێشنیاری ڕاستکردنەوەی شەجەرە", guide_correct_intro:"کەسێک ون بووە، ساڵێک هەڵەیە، دایک یان باوکێک تێکەڵ بووە؟ پێمان بڵێ.",
  guide_correct_1:"بچۆ ژوورەوە، پاشان بەشی شەجەرە بکەرەوە.",
  guide_correct_2:"لە سەر کەسەکە بدە و پێشنیاری ڕاستکردنەوە هەڵبژێرە — یان دوگمەی پەڕەی شەجەرە بەکاربهێنە بۆ کەسێک کە هێشتا تێدا نییە.",
  guide_correct_3:"بنووسە چی دەبێت بگۆڕدرێت و ئەگەر توانیت، چۆن دەیزانیت.",
  guide_correct_4:"بەڕێوەبەرێک پێداچوونەوەی بۆ دەکات و شەجەرەکە نوێ دەکاتەوە. دۆخەکەی لە نێردراوەکانمدا دەبینیت.",
  guide_photo:"هاوبەشکردنی وێنە", guide_photo_intro:"وێنە کۆنەکانی بنەماڵە لە بەنرخترین شتەکانی ئەرشیفەکەن.",
  guide_photo_1:"بچۆ ژوورەوە، بەشی گالەری بکەرەوە و لە سەر ناردنی وێنە بدە.",
  guide_photo_2:"وێنەیەکی JPEG، PNG یان WebP تا ٣ مێگابایت هەڵبژێرە. وێنەگرتن بە مۆبایل لە وێنەیەکی چاپکراو باشە.",
  guide_photo_3:"ناونیشان و وەسفێکی بۆ بنووسە: کێ تێدایە، لە کوێ و نزیکەی کەی.",
  guide_photo_4:"دوای پەسەندکردنی لەلایەن بەڕێوەبەرێکەوە، لە گالەرییەکەدا بۆ بنەماڵە دەردەکەوێت.",
  guide_story:"نووسینی چیرۆک یان بابەت", guide_story_intro:"یادەوەری، مێژوو و هەواڵی بنەماڵە هەمووی جێگەی لێرەدایە.",
  guide_story_1:"بچۆ ژوورەوە، بەشی بلۆگ بکەرەوە و لە سەر نووسینی بابەت بدە.",
  guide_story_2:"بەشێک هەڵبژێرە: یادەوەری، مێژوو یان هەواڵی بنەماڵە.",
  guide_story_3:"بە کوردی یان ئینگلیزی — یان هەردووکیان — بنووسە و بینێرە بۆ پێداچوونەوە.",
  guide_story_4:"دوای پەسەندکردن، لە بلۆگ و پەڕەی سەرەکیدا بڵاو دەکرێتەوە.",
  guide_track:"شوێنکەوتنی نێردراوەکانت", guide_track_intro:"هەموو ئەوەی دەینێریت پێش بڵاوکردنەوە پێداچوونەوەی بۆ دەکرێت.",
  guide_track_1:"لە سەرەوەی پەڕەکە لە سەر ناوەکەت بدە و نێردراوەکانم هەڵبژێرە.",
  guide_track_2:"هەر بابەتێک پیشان دەدات چاوەڕوانی پێداچوونەوەیە، پەسەندکراوە یان ڕەتکراوەتەوە.",
  guide_track_3:"ئەگەر شتێک ڕەتکرایەوە و پێتوایە دەبێت دابنرێت، دووبارە بە وردەکاریی زیاترەوە بینێرەوە.",
  guide_profile:"دانانی ناو و وێنەکەت", guide_profile_intro:"کاتێک لە ژوورەوەیت، ناوی یەکەم و وێنەکەت لە گۆشەی سەرەوە دەردەکەون.",
  guide_profile_1:"لە سەرەوەی پەڕەکە لە سەر ناوەکەت بدە و پرۆفایل هەڵبژێرە.",
  guide_profile_2:"ناوی یەکەمت بگۆڕە، یان وێنەیەک هەڵبژێرە و بیجووڵێنە و گەورەی بکە تا لە بازنەکەدا جێ بگرێت.",
  guide_profile_3:"لە سەر پاشەکەوتکردن بدە. گۆڕانکارییەکە لە هەموو ئامێرەکانتدا دەردەکەوێت.",
  guide_install:"زیادکردنی ئەرشیف بۆ مۆبایلەکەت", guide_install_intro:"وەک ئەپێک، ڕاستەوخۆ لە شاشەی سەرەکییەوە بیکەرەوە.",
  guide_install_1:"ئایفۆن: ماڵپەڕەکە لە سافاری بکەرەوە، لە سەر Share بدە، پاشان Add to Home Screen.",
  guide_install_2:"ئەندرۆید: ماڵپەڕەکە لە کرۆم بکەرەوە، لە سەر لیستی ⋮ بدە، پاشان Add to Home screen یان Install app.",
  guide_install_3:"پاشان ئایکۆنی میراودەلی لەگەڵ ئەپەکانی ترتدا دەردەکەوێت.",
  guide_help:"یارمەتیت دەوێت؟", guide_help_intro:"ئەگەر شتێک کار ناکات یان پرسیارێکت هەیە، لە ڕێی پێشنیاری ڕاستکردنەوەی شەجەرەوە بینێرە و بەڕێوەبەرانی ئەرشیف وەڵامت دەدەنەوە.",
});

Object.assign(production.en, { privacyGoogle:"If you sign in with Google, the site receives only your name, email address and profile photo from Google. They are used to show your account and are never shared." });
Object.assign(production.ckb, { privacyGoogle:"ئەگەر بە گووگڵ بچیتە ژوورەوە، ماڵپەڕەکە تەنها ناو و ئیمەیڵ و وێنەی پرۆفایلەکەت لە گووگڵەوە وەردەگرێت. تەنها بۆ پیشاندانی هەژمارەکەت بەکاردێن و هەرگیز هاوبەش ناکرێن." });

Object.assign(production.en, {
  loginSubtitle:"Welcome back. Sign in to share photos, stories and corrections.", signupSubtitle:"Join the family archive. It only takes a minute.",
  googleLogin:"Sign in with Google", googleSignup:"Sign up with Google", or:"or", forgotPassword:"Forgot password?",
  passwordHint:"At least 8 characters.", sendResetLink:"Send reset link", resetHint:"Enter your email address and we'll send you a link to choose a new password.",
  newPasswordHint:"Choose a new password for your account.", backToSignIn:"Back to sign in", newHere:"New here?", seeHowItWorks:"See how it works",
  notSure:"Not sure what to send?", readGuide:"Read the guide",
  invalidRelationship:"Check the years and relationships. Someone can't be their own ancestor, or both a parent and a partner.",
});
Object.assign(production.ckb, {
  loginSubtitle:"بەخێربێیتەوە. بچۆ ژوورەوە بۆ هاوبەشکردنی وێنە و چیرۆک و ڕاستکردنەوە.", signupSubtitle:"ببە بە بەشێک لە ئەرشیفی بنەماڵە. تەنها یەک خولەک دەخایەنێت.",
  googleLogin:"چوونەژوورەوە بە گووگڵ", googleSignup:"خۆتۆمارکردن بە گووگڵ", or:"یان", forgotPassword:"وشەی نهێنیت لەبیرچووە؟",
  passwordHint:"لانیکەم ٨ پیت.", sendResetLink:"ناردنی بەستەر", resetHint:"ئیمەیڵەکەت بنووسە و بەستەرێکت بۆ دەنێرین بۆ دانانی وشەی نهێنی نوێ.",
  newPasswordHint:"وشەی نهێنییەکی نوێ بۆ هەژمارەکەت هەڵبژێرە.", backToSignIn:"گەڕانەوە بۆ چوونەژوورەوە", newHere:"نوێیت لێرە؟", seeHowItWorks:"ببینە چۆن کار دەکات",
  notSure:"دڵنیا نیت چی بنێریت؟", readGuide:"ڕێنمایی بخوێنەوە",
  invalidRelationship:"ساڵ و پەیوەندییەکان بپشکنە. کەس نابێت باپیری خۆی بێت، یان هەم دایک یان باوک و هەم هاوسەر بێت.",
});

Object.assign(production.en, {
  familiesStat:"Families in the tribe, estimated",
  statMembers:"Family members added to the tree", statMembersOne:"Family member added to the tree",
  statPhotos:"Photos uploaded to the gallery", statPhotosOne:"Photo uploaded to the gallery",
  statStories:"Stories shared on the blog", statStoriesOne:"Story shared on the blog",
});
Object.assign(production.ckb, {
  familiesStat:"خێزانی هۆزەکە، بە مەزەندە",
  statMembers:"ئەندام زیادکراون بۆ شەجەرەکە", statMembersOne:"ئەندام زیادکراوە بۆ شەجەرەکە",
  statPhotos:"وێنە بارکراون بۆ گالەری", statPhotosOne:"وێنە بارکراوە بۆ گالەری",
  statStories:"چیرۆک هاوبەشکراون لە بلۆگ", statStoriesOne:"چیرۆک هاوبەشکراوە لە بلۆگ",
});
