import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Cache for preloaded images
const imageCache = new Map<number, HTMLImageElement>();

// Maximum number of images to keep in memory cache
const MAX_CACHE_SIZE = 20;

// imgbb URLs for Quran pages
const IMGBB_URLS: Record<string, string> = {
  '001': 'https://i.ibb.co/5XpKN8pM/001.png',
  '002': 'https://i.ibb.co/ks0cmb3d/002.png',
  '003': 'https://i.ibb.co/LqJ9Y9L/003.png',
  '004': 'https://i.ibb.co/kV3nRpSL/004.png',
  '005': 'https://i.ibb.co/LdbNggW9/005.png',
  '006': 'https://i.ibb.co/b5NkwP53/006.png',
  '007': 'https://i.ibb.co/1fVtpQWW/007.png',
  '008': 'https://i.ibb.co/x8rqY2Q0/008.png',
  '009': 'https://i.ibb.co/HLrD2QJV/009.png',
  '010': 'https://i.ibb.co/Gvx6NyKK/010.png',
  '011': 'https://i.ibb.co/LXbMfRP7/011.png',
  '012': 'https://i.ibb.co/Jw226R4B/012.png',
  '013': 'https://i.ibb.co/mVYHG1BB/013.png',
  '014': 'https://i.ibb.co/YFPYbsrD/014.png',
  '015': 'https://i.ibb.co/0y3tLsjZ/015.png',
  '016': 'https://i.ibb.co/dwWsGbsp/016.png',
  '017': 'https://i.ibb.co/6zKkQBY/017.png',
  '018': 'https://i.ibb.co/8ngh6qPW/018.png',
  '019': 'https://i.ibb.co/B5VYTfGG/019.png',
  '020': 'https://i.ibb.co/ymMXscdc/020.png',
  '021': 'https://i.ibb.co/8LL9vhCz/021.png',
  '022': 'https://i.ibb.co/WvNm0Wfy/022.png',
  '023': 'https://i.ibb.co/qLMnKZsP/023.png',
  '024': 'https://i.ibb.co/PGLtq6Fh/024.png',
  '025': 'https://i.ibb.co/R4jXrpV0/025.png',
  '026': 'https://i.ibb.co/M5RnS5MQ/026.png',
  '027': 'https://i.ibb.co/NdZ74NkB/027.png',
  '028': 'https://i.ibb.co/Y7C6LZRR/028.png',
  '029': 'https://i.ibb.co/4wTQRCPB/029.png',
  '030': 'https://i.ibb.co/YBrkJjC8/030.png',
  '031': 'https://i.ibb.co/3y5WN85T/031.png',
  '032': 'https://i.ibb.co/RGyH15Zx/032.png',
  '033': 'https://i.ibb.co/r2DFRkbm/033.png',
  '034': 'https://i.ibb.co/B2NS6wmS/034.png',
  '035': 'https://i.ibb.co/DHNsq0p7/035.png',
  '036': 'https://i.ibb.co/zWwxn5j7/036.png',
  '037': 'https://i.ibb.co/23pN9dkS/037.png',
  '038': 'https://i.ibb.co/j9rJvrpz/038.png',
  '039': 'https://i.ibb.co/Cszzgkzj/039.png',
  '040': 'https://i.ibb.co/jv893XPy/040.png',
  '041': 'https://i.ibb.co/3mBgKJB9/041.png',
  '042': 'https://i.ibb.co/Y4QYJqQ9/042.png',
  '043': 'https://i.ibb.co/4n77XsFt/043.png',
  '044': 'https://i.ibb.co/0j2XtTNb/044.png',
  '045': 'https://i.ibb.co/7wpXpmb/045.png',
  '046': 'https://i.ibb.co/p66dG3ZT/046.png',
  '047': 'https://i.ibb.co/xqzZW6R4/047.png',
  '048': 'https://i.ibb.co/Pv29Wnd0/048.png',
  '049': 'https://i.ibb.co/9kzDcXb5/049.png',
  '050': 'https://i.ibb.co/qYScF1qX/050.png',
  '051': 'https://i.ibb.co/ycB3gDk8/051.png',
  '052': 'https://i.ibb.co/TDkv84Gj/052.png',
  '053': 'https://i.ibb.co/9kSLWP6N/053.png',
  '054': 'https://i.ibb.co/LdDtxGBM/054.png',
  '055': 'https://i.ibb.co/ksCJHNm0/055.png',
  '056': 'https://i.ibb.co/Tq1bP8LG/056.png',
  '057': 'https://i.ibb.co/pv6PNY3Z/057.png',
  '058': 'https://i.ibb.co/kTKV9H5/058.png',
  '059': 'https://i.ibb.co/zHLCpJ1C/059.png',
  '060': 'https://i.ibb.co/gMHzfzGj/060.png',
  '061': 'https://i.ibb.co/HTHyjTy8/061.png',
  '062': 'https://i.ibb.co/N2wPLPM6/062.png',
  '063': 'https://i.ibb.co/q3NhMqtP/063.png',
  '064': 'https://i.ibb.co/d0RX5Qf2/064.png',
  '065': 'https://i.ibb.co/q3BRcCJH/065.png',
  '066': 'https://i.ibb.co/DgVR1xZW/066.png',
  '067': 'https://i.ibb.co/TMV4yhKY/067.png',
  '068': 'https://i.ibb.co/tTDLshnf/068.png',
  '069': 'https://i.ibb.co/Xk3RkfMg/069.png',
  '070': 'https://i.ibb.co/ksgvzgyH/070.png',
  '071': 'https://i.ibb.co/Yzf8t4z/071.png',
  '072': 'https://i.ibb.co/ZRvbMBth/072.png',
  '073': 'https://i.ibb.co/5XNcT72f/073.png',
  '074': 'https://i.ibb.co/C32kk5St/074.png',
  '075': 'https://i.ibb.co/MynSStmx/075.png',
  '076': 'https://i.ibb.co/cKh1KZ34/076.png',
  '077': 'https://i.ibb.co/vC0DMzsr/077.png',
  '078': 'https://i.ibb.co/G3v39v3R/078.png',
  '079': 'https://i.ibb.co/1JZ7HLXk/079.png',
  '080': 'https://i.ibb.co/xKBMdsw0/080.png',
  '081': 'https://i.ibb.co/PLhGY2M/081.png',
  '082': 'https://i.ibb.co/s9xQmtdC/082.png',
  '083': 'https://i.ibb.co/svp2MPtb/083.png',
  '084': 'https://i.ibb.co/nMNKFFrf/084.png',
  '085': 'https://i.ibb.co/zHR62C7K/085.png',
  '086': 'https://i.ibb.co/HLmZBrLP/086.png',
  '087': 'https://i.ibb.co/hT62zR4/087.png',
  '088': 'https://i.ibb.co/CsNvf8Ng/088.png',
  '089': 'https://i.ibb.co/5grdDMFR/089.png',
  '090': 'https://i.ibb.co/RGffWsNb/090.png',
  '091': 'https://i.ibb.co/j9z4y5HW/091.png',
  '092': 'https://i.ibb.co/d0bh4zj9/092.png',
  '093': 'https://i.ibb.co/4w6DMksr/093.png',
  '094': 'https://i.ibb.co/Ng1TRBbZ/094.png',
  '095': 'https://i.ibb.co/4ngP4rhN/095.png',
  '096': 'https://i.ibb.co/QvHPJ6JJ/096.png',
  '097': 'https://i.ibb.co/93GHNVbY/097.png',
  '098': 'https://i.ibb.co/MkBVBgtF/098.png',
  '099': 'https://i.ibb.co/1csD0SP/099.png',
  '100': 'https://i.ibb.co/HfnjbbCj/100.png',
  '101': 'https://i.ibb.co/yngMYwdY/101.png',
  '102': 'https://i.ibb.co/GLLCzHK/102.png',
  '103': 'https://i.ibb.co/XkrzKZdT/103.png',
  '104': 'https://i.ibb.co/LDMdTsq7/104.png',
  '105': 'https://i.ibb.co/hR9RVJJ5/105.png',
  '106': 'https://i.ibb.co/vxxJBvYq/106.png',
  '107': 'https://i.ibb.co/20P614GW/107.png',
  '108': 'https://i.ibb.co/DgDtB7kb/108.png',
  '109': 'https://i.ibb.co/wFTGs1j9/109.png',
  '110': 'https://i.ibb.co/B2XDZjXt/110.png',
  '111': 'https://i.ibb.co/DfzZyJjC/111.png',
  '112': 'https://i.ibb.co/jvqT3bTf/112.png',
  '113': 'https://i.ibb.co/4wz8DdHs/113.png',
  '114': 'https://i.ibb.co/fVKXx5ym/114.png',
  '115': 'https://i.ibb.co/h191NMDp/115.png',
  '116': 'https://i.ibb.co/ds6FT02f/116.png',
  '117': 'https://i.ibb.co/WNstkMTf/117.png',
  '118': 'https://i.ibb.co/fV6GGggD/118.png',
  '119': 'https://i.ibb.co/5XyhLcK0/119.png',
  '120': 'https://i.ibb.co/kg1kgsN7/120.png',
  '121': 'https://i.ibb.co/QFhbKMwY/121.png',
  '122': 'https://i.ibb.co/KjmMyCYk/122.png',
  '123': 'https://i.ibb.co/6RQyKKKk/123.png',
  '124': 'https://i.ibb.co/LDxg8Kwy/124.png',
  '125': 'https://i.ibb.co/4gFJVRY0/125.png',
  '126': 'https://i.ibb.co/33QYr06/126.png',
  '127': 'https://i.ibb.co/B5JLXppB/127.png',
  '128': 'https://i.ibb.co/k2csd5w5/128.png',
  '129': 'https://i.ibb.co/nsVXkvfc/129.png',
  '130': 'https://i.ibb.co/QFJXSfzx/130.png',
  '131': 'https://i.ibb.co/BHyKntp5/131.png',
  '132': 'https://i.ibb.co/n85BCMR0/132.png',
  '133': 'https://i.ibb.co/2Ym5nmRh/133.png',
  '134': 'https://i.ibb.co/GfP1j2KD/134.png',
  '135': 'https://i.ibb.co/6RkZ9gTM/135.png',
  '136': 'https://i.ibb.co/C31xRpGB/136.png',
  '137': 'https://i.ibb.co/yBqsPtrZ/137.png',
  '138': 'https://i.ibb.co/TMD5qXvs/138.png',
  '139': 'https://i.ibb.co/vCJKVbnN/139.png',
  '140': 'https://i.ibb.co/hJPSJ3y1/140.png',
  '141': 'https://i.ibb.co/TBTh35FZ/141.png',
  '142': 'https://i.ibb.co/1fHwxCCS/142.png',
  '143': 'https://i.ibb.co/RTVdzc6K/143.png',
  '144': 'https://i.ibb.co/R8rs0Wh/144.png',
  '145': 'https://i.ibb.co/HLXY7Y4D/145.png',
  '146': 'https://i.ibb.co/pjdZ320f/146.png',
  '147': 'https://i.ibb.co/d0tkZBr3/147.png',
  '148': 'https://i.ibb.co/67Fdf7WC/148.png',
  '149': 'https://i.ibb.co/1fH4vT4v/149.png',
  '150': 'https://i.ibb.co/QF9nhgrQ/150.png',
  '151': 'https://i.ibb.co/Cpx9tGQh/151.png',
  '152': 'https://i.ibb.co/WWqkjS03/152.png',
  '153': 'https://i.ibb.co/23z4d50K/153.png',
  '154': 'https://i.ibb.co/2108Q3N6/154.png',
  '155': 'https://i.ibb.co/xq8vwm08/155.png',
  '156': 'https://i.ibb.co/pYWn4F3/156.png',
  '157': 'https://i.ibb.co/JRqhvp1p/157.png',
  '158': 'https://i.ibb.co/Y4RCLrt0/158.png',
  '159': 'https://i.ibb.co/chcqYb79/159.png',
  '160': 'https://i.ibb.co/5hRBgr2h/160.png',
  '161': 'https://i.ibb.co/4nnn69dW/161.png',
  '162': 'https://i.ibb.co/3ySW87NN/162.png',
  '163': 'https://i.ibb.co/23RsDm5W/163.png',
  '164': 'https://i.ibb.co/cc1DbY9S/164.png',
  '165': 'https://i.ibb.co/7tvd2Lyy/165.png',
  '166': 'https://i.ibb.co/27507fHh/166.png',
  '167': 'https://i.ibb.co/DBvzHSL/167.png',
  '168': 'https://i.ibb.co/S73p160m/168.png',
  '169': 'https://i.ibb.co/tTR5K3Jz/169.png',
  '170': 'https://i.ibb.co/99RKZ3X3/170.png',
  '171': 'https://i.ibb.co/twzC261z/171.png',
  '172': 'https://i.ibb.co/jkzsCzFh/172.png',
  '173': 'https://i.ibb.co/6J44R1wT/173.png',
  '174': 'https://i.ibb.co/C3PNVkDQ/174.png',
  '175': 'https://i.ibb.co/zhfPgSDd/175.png',
  '176': 'https://i.ibb.co/jPz7kHnS/176.png',
  '177': 'https://i.ibb.co/S4xZb38X/177.png',
  '178': 'https://i.ibb.co/sJkgXMpc/178.png',
  '179': 'https://i.ibb.co/7db0Zw12/179.png',
  '180': 'https://i.ibb.co/fdHgZ4yj/180.png',
  '181': 'https://i.ibb.co/gFHBPVx1/181.png',
  '182': 'https://i.ibb.co/1tszj6S3/182.png',
  '183': 'https://i.ibb.co/1GyNZmw7/183.png',
  '184': 'https://i.ibb.co/nNGRXx7v/184.png',
  '185': 'https://i.ibb.co/FLvb9wty/185.png',
  '186': 'https://i.ibb.co/wNwMJt9R/186.png',
  '187': 'https://i.ibb.co/r2ThkYz0/187.png',
  '188': 'https://i.ibb.co/zVvzNYk5/188.png',
  '189': 'https://i.ibb.co/DdZFBpF/189.png',
  '190': 'https://i.ibb.co/d4sYrv3N/190.png',
  '191': 'https://i.ibb.co/HLZ5by8q/191.png',
  '192': 'https://i.ibb.co/JFkkrh6D/192.png',
  '193': 'https://i.ibb.co/h1D8HnjX/193.png',
  '194': 'https://i.ibb.co/fGxFsk4W/194.png',
  '195': 'https://i.ibb.co/nxf0b4s/195.png',
  '196': 'https://i.ibb.co/8Djjc1Vf/196.png',
  '197': 'https://i.ibb.co/VYdVw2B3/197.png',
  '198': 'https://i.ibb.co/tn7QDhW/198.png',
  '199': 'https://i.ibb.co/pB89zxJ4/199.png',
  '200': 'https://i.ibb.co/Y79pHpjN/200.png',
  '201': 'https://i.ibb.co/Fb8b8rrb/201.png',
  '202': 'https://i.ibb.co/MXnz3Qv/202.png',
  '203': 'https://i.ibb.co/3Y0nJ58f/203.png',
  '204': 'https://i.ibb.co/4wkB7FMc/204.png',
  '205': 'https://i.ibb.co/3J2dCmW/205.png',
  '206': 'https://i.ibb.co/k6sqrnps/206.png',
  '207': 'https://i.ibb.co/Zp1VJ68K/207.png',
  '208': 'https://i.ibb.co/SXPLQwdk/208.png',
  '209': 'https://i.ibb.co/7xr0XBkr/209.png',
  '210': 'https://i.ibb.co/KcRQMDXK/210.png',
  '211': 'https://i.ibb.co/qLk1sLf6/211.png',
  '212': 'https://i.ibb.co/8gdVHDMJ/212.png',
  '213': 'https://i.ibb.co/gLqcHmgv/213.png',
  '214': 'https://i.ibb.co/S77FB84h/214.png',
  '215': 'https://i.ibb.co/Q7ygHxhQ/215.png',
  '216': 'https://i.ibb.co/3mzmft9F/216.png',
  '217': 'https://i.ibb.co/21gSVg0x/217.png',
  '218': 'https://i.ibb.co/cqVgF3y/218.png',
  '219': 'https://i.ibb.co/4n9Snp9b/219.png',
  '220': 'https://i.ibb.co/v6gFKxDR/220.png',
  '221': 'https://i.ibb.co/1tb8t10h/221.png',
  '222': 'https://i.ibb.co/LdSnNbmh/222.png',
  '223': 'https://i.ibb.co/s9Z4SMLr/223.png',
  '224': 'https://i.ibb.co/NgVM2mYB/224.png',
  '225': 'https://i.ibb.co/rGLXsv1m/225.png',
  '226': 'https://i.ibb.co/DfHrJDJN/226.png',
  '227': 'https://i.ibb.co/d4Whbc95/227.png',
  '228': 'https://i.ibb.co/svvKL97r/228.png',
  '229': 'https://i.ibb.co/fYMMBZrw/229.png',
  '230': 'https://i.ibb.co/FL0KBJ73/230.png',
  '231': 'https://i.ibb.co/84fg1f1X/231.png',
  '232': 'https://i.ibb.co/35NcZYHS/232.png',
  '233': 'https://i.ibb.co/zT4QRsBY/233.png',
  '234': 'https://i.ibb.co/VY5WQK7q/234.png',
  '235': 'https://i.ibb.co/60ch0pY0/235.png',
  '236': 'https://i.ibb.co/v41JJW12/236.png',
  '237': 'https://i.ibb.co/MxdCPHWJ/237.png',
  '238': 'https://i.ibb.co/67PSC67C/238.png',
  '239': 'https://i.ibb.co/jPfm4QvH/239.png',
  '240': 'https://i.ibb.co/CKTRTQyS/240.png',
  '241': 'https://i.ibb.co/WvQKNvcN/241.png',
  '242': 'https://i.ibb.co/PvKf04FM/242.png',
  '243': 'https://i.ibb.co/TDtPhGGZ/243.png',
  '244': 'https://i.ibb.co/Mx0QXMpT/244.png',
  '245': 'https://i.ibb.co/0jyt7nGS/245.png',
  '246': 'https://i.ibb.co/zhCBtz3Y/246.png',
  '247': 'https://i.ibb.co/Wv1vnL8B/247.png',
  '248': 'https://i.ibb.co/6Rp9ZMKt/248.png',
  '249': 'https://i.ibb.co/Gf4PkKbp/249.png',
  '250': 'https://i.ibb.co/CKgQ2NJT/250.png',
  '251': 'https://i.ibb.co/J9pxVDn/251.png',
  '252': 'https://i.ibb.co/spKj8Hvg/252.png',
  '253': 'https://i.ibb.co/rf7RWB9r/253.png',
  '254': 'https://i.ibb.co/rK9qg0PR/254.png',
  '255': 'https://i.ibb.co/TDGZQQH3/255.png',
  '256': 'https://i.ibb.co/svV1HLBt/256.png',
  '257': 'https://i.ibb.co/v4RQDY0H/257.png',
  '258': 'https://i.ibb.co/CKLdN9Wq/258.png',
  '259': 'https://i.ibb.co/mrxQdyZt/259.png',
  '260': 'https://i.ibb.co/d0yJ0mGC/260.png',
  '261': 'https://i.ibb.co/5W3P60px/261.png',
  '262': 'https://i.ibb.co/67Xr188L/262.png',
  '263': 'https://i.ibb.co/QvDwqgCs/263.png',
  '264': 'https://i.ibb.co/NgJZk914/264.png',
  '265': 'https://i.ibb.co/gbcLhhkR/265.png',
  '266': 'https://i.ibb.co/7tnFhXBq/266.png',
  '267': 'https://i.ibb.co/0pjWN2sv/267.png',
  '268': 'https://i.ibb.co/35HXcktt/268.png',
  '269': 'https://i.ibb.co/v6fW2s1w/269.png',
  '270': 'https://i.ibb.co/Fk2WhBqL/270.png',
  '271': 'https://i.ibb.co/cScrMRgK/271.png',
  '272': 'https://i.ibb.co/4RNYJhm6/272.png',
  '273': 'https://i.ibb.co/0R346GbG/273.png',
  '274': 'https://i.ibb.co/Vkc6zWq/274.png',
  '275': 'https://i.ibb.co/27hXKhZk/275.png',
  '276': 'https://i.ibb.co/zWybgF1p/276.png',
  '277': 'https://i.ibb.co/pjxRWhGq/277.png',
  '278': 'https://i.ibb.co/4R65Xm8P/278.png',
  '279': 'https://i.ibb.co/FrwWBMQ/279.png',
  '280': 'https://i.ibb.co/hRxB1tVh/280.png',
  '281': 'https://i.ibb.co/jkY2Q0zV/281.png',
  '282': 'https://i.ibb.co/WNtVBLCv/282.png',
  '283': 'https://i.ibb.co/bkzpMRR/283.png',
  '284': 'https://i.ibb.co/XxBPn09M/284.png',
  '285': 'https://i.ibb.co/JRZPmm2F/285.png',
  '286': 'https://i.ibb.co/mrpvPpGZ/286.png',
  '287': 'https://i.ibb.co/vx64JmT0/287.png',
  '288': 'https://i.ibb.co/8g9L3q2m/288.png',
  '289': 'https://i.ibb.co/vCf5kFyj/289.png',
  '290': 'https://i.ibb.co/xK2XFRRv/290.png',
  '291': 'https://i.ibb.co/cKBxxqg1/291.png',
  '292': 'https://i.ibb.co/B2128JJB/292.png',
  '293': 'https://i.ibb.co/B2BJBc1z/293.png',
  '294': 'https://i.ibb.co/4g5kwGh3/294.png',
  '295': 'https://i.ibb.co/xt8vP36p/295.png',
  '296': 'https://i.ibb.co/fzNQr8wW/296.png',
  '297': 'https://i.ibb.co/pBD6yZXR/297.png',
  '298': 'https://i.ibb.co/9mGkBsQs/298.png',
  '299': 'https://i.ibb.co/k66FgHq5/299.png',
  '300': 'https://i.ibb.co/4wBY71PB/300.png',
  '301': 'https://i.ibb.co/MwZSBKJ/301.png',
  '302': 'https://i.ibb.co/39wPnykW/302.png',
  '303': 'https://i.ibb.co/fzxC9vYC/303.png',
  '304': 'https://i.ibb.co/4w0TH55q/304.png',
  '305': 'https://i.ibb.co/q39pDPfr/305.png',
  '306': 'https://i.ibb.co/Xf0vsrg4/306.png',
  '307': 'https://i.ibb.co/XfTbYd4L/307.png',
  '308': 'https://i.ibb.co/VprPDyxf/308.png',
  '309': 'https://i.ibb.co/ZRj3B6YK/309.png',
  '310': 'https://i.ibb.co/7xr5rSJH/310.png',
  '311': 'https://i.ibb.co/nq9DHVrL/311.png',
  '312': 'https://i.ibb.co/PzF5pWXx/312.png',
  '313': 'https://i.ibb.co/SDDcyxV6/313.png',
  '314': 'https://i.ibb.co/zV576ZgC/314.png',
  '315': 'https://i.ibb.co/39B7dp0k/315.png',
  '316': 'https://i.ibb.co/hxVhZB0d/316.png',
  '317': 'https://i.ibb.co/tTVFpT2B/317.png',
  '318': 'https://i.ibb.co/Fk1rzMGk/318.png',
  '319': 'https://i.ibb.co/3J6f0qK/319.png',
  '320': 'https://i.ibb.co/MDph4zT8/320.png',
  '321': 'https://i.ibb.co/pBTd0W2h/321.png',
  '322': 'https://i.ibb.co/KjMGz7Dg/322.png',
  '323': 'https://i.ibb.co/d4TWPFwR/323.png',
  '324': 'https://i.ibb.co/hRVMXdfc/324.png',
  '325': 'https://i.ibb.co/4Zk2P6Zc/325.png',
  '326': 'https://i.ibb.co/0yyzrdd1/326.png',
  '327': 'https://i.ibb.co/rRS1MRLw/327.png',
  '328': 'https://i.ibb.co/20z2FSwR/328.png',
  '329': 'https://i.ibb.co/Lzc7h4YG/329.png',
  '330': 'https://i.ibb.co/d4Rw7HTc/330.png',
  '331': 'https://i.ibb.co/Fkyy5mPN/331.png',
  '332': 'https://i.ibb.co/n8QMHCxj/332.png',
  '333': 'https://i.ibb.co/HfTyc8P0/333.png',
  '334': 'https://i.ibb.co/dFmh6jg/334.png',
  '335': 'https://i.ibb.co/MySzHDKF/335.png',
  '336': 'https://i.ibb.co/Swp5VPdP/336.png',
  '337': 'https://i.ibb.co/5h7Y1W0J/337.png',
  '338': 'https://i.ibb.co/M5pMKR7Y/338.png',
  '339': 'https://i.ibb.co/2Yv0PX1v/339.png',
  '340': 'https://i.ibb.co/4ZJyyGV5/340.png',
  '341': 'https://i.ibb.co/vxVSM6kG/341.png',
  '342': 'https://i.ibb.co/0ykYCPvR/342.png',
  '343': 'https://i.ibb.co/hNMSybQ/343.png',
  '344': 'https://i.ibb.co/sdg7b6p7/344.png',
  '345': 'https://i.ibb.co/vxsrsH9H/345.png',
  '346': 'https://i.ibb.co/SXYT6GBD/346.png',
  '347': 'https://i.ibb.co/v6LNqTky/347.png',
  '348': 'https://i.ibb.co/hjdmyKy/348.png',
  '349': 'https://i.ibb.co/fGLWRFRw/349.png',
  '350': 'https://i.ibb.co/YTL1fhCH/350.png',
  '351': 'https://i.ibb.co/WWZSqgj9/351.png',
  '352': 'https://i.ibb.co/JWhNdP5F/352.png',
  '353': 'https://i.ibb.co/35TKgN4f/353.png',
  '354': 'https://i.ibb.co/dRVzHbR/354.png',
  '355': 'https://i.ibb.co/R4S1J9rK/355.png',
  '356': 'https://i.ibb.co/HDwpZbTp/356.png',
  '357': 'https://i.ibb.co/KcdCzmsY/357.png',
  '358': 'https://i.ibb.co/fYyBvXND/358.png',
  '359': 'https://i.ibb.co/C3V7M48z/359.png',
  '360': 'https://i.ibb.co/Zz1fVFkm/360.png',
  '361': 'https://i.ibb.co/gL7vWS1s/361.png',
  '362': 'https://i.ibb.co/DJz67sD/362.png',
  '363': 'https://i.ibb.co/bjw19BdK/363.png',
  '364': 'https://i.ibb.co/bMLrvwM9/364.png',
  '365': 'https://i.ibb.co/PsTggsJh/365.png',
  '366': 'https://i.ibb.co/kVs4hsPr/366.png',
  '367': 'https://i.ibb.co/tPWddYGz/367.png',
  '368': 'https://i.ibb.co/9kdbgQ7P/368.png',
  '369': 'https://i.ibb.co/ZRqzbsKy/369.png',
  '370': 'https://i.ibb.co/xKt4BQJC/370.png',
  '371': 'https://i.ibb.co/Wv95ymL3/371.png',
  '372': 'https://i.ibb.co/F4vPsZ7Z/372.png',
  '373': 'https://i.ibb.co/H3LmjvW/373.png',
  '374': 'https://i.ibb.co/pjc7JTnv/374.png',
  '375': 'https://i.ibb.co/QvDy5Smy/375.png',
  '376': 'https://i.ibb.co/TBmBqRRh/376.png',
  '377': 'https://i.ibb.co/ccydtyhW/377.png',
  '378': 'https://i.ibb.co/8T4HhsM/378.png',
  '379': 'https://i.ibb.co/nNB2T3zK/379.png',
  '380': 'https://i.ibb.co/84YbHkbd/380.png',
  '381': 'https://i.ibb.co/rYQ67gN/381.png',
  '382': 'https://i.ibb.co/NgVw18NH/382.png',
  '383': 'https://i.ibb.co/W41NR367/383.png',
  '384': 'https://i.ibb.co/gQd2j97/384.png',
  '385': 'https://i.ibb.co/wFXMZWB7/385.png',
  '386': 'https://i.ibb.co/8gL2hK0H/386.png',
  '387': 'https://i.ibb.co/cj8Qwkq/387.png',
  '388': 'https://i.ibb.co/3yQ6htgz/388.png',
  '389': 'https://i.ibb.co/M5V6JhcF/389.png',
  '390': 'https://i.ibb.co/PZXR2nbv/390.png',
  '391': 'https://i.ibb.co/spp0V9rp/391.png',
  '392': 'https://i.ibb.co/Y7dJvXPQ/392.png',
  '393': 'https://i.ibb.co/Fb0MVZ7p/393.png',
  '394': 'https://i.ibb.co/zYJwjPz/394.png',
  '395': 'https://i.ibb.co/Lh9N3Rwy/395.png',
  '396': 'https://i.ibb.co/Lh20NpM8/396.png',
  '397': 'https://i.ibb.co/GQpWyk4S/397.png',
  '398': 'https://i.ibb.co/Q3FTm0pr/398.png',
  '399': 'https://i.ibb.co/My0yG7Gq/399.png',
  '400': 'https://i.ibb.co/8DNRwKJM/400.png',
  '401': 'https://i.ibb.co/TqnHgyZ5/401.png',
  '402': 'https://i.ibb.co/93WSpwTn/402.png',
  '403': 'https://i.ibb.co/VWn9rSB2/403.png',
  '404': 'https://i.ibb.co/200BTcsc/404.png',
  '405': 'https://i.ibb.co/Cpbn1PjG/405.png',
  '406': 'https://i.ibb.co/gh16zBg/406.png',
  '407': 'https://i.ibb.co/k26zjsyV/407.png',
  '408': 'https://i.ibb.co/hbddJsf/408.png',
  '409': 'https://i.ibb.co/mCdC7Fmg/409.png',
  '410': 'https://i.ibb.co/Ldk1Bfbr/410.png',
  '411': 'https://i.ibb.co/wm4jbwY/411.png',
  '412': 'https://i.ibb.co/3mmpnD8S/412.png',
  '413': 'https://i.ibb.co/5x21GNjh/413.png',
  '414': 'https://i.ibb.co/chSpPZzM/414.png',
  '415': 'https://i.ibb.co/nqXf6Nrq/415.png',
  '416': 'https://i.ibb.co/NnxJCrdJ/416.png',
  '417': 'https://i.ibb.co/v707ymY/417.png',
  '418': 'https://i.ibb.co/MDwFHJz0/418.png',
  '419': 'https://i.ibb.co/mKxpbQS/419.png',
  '420': 'https://i.ibb.co/nNxTtBk2/420.png',
  '421': 'https://i.ibb.co/GvQP0wz8/421.png',
  '422': 'https://i.ibb.co/p6pyzPxx/422.png',
  '423': 'https://i.ibb.co/B2QtKk30/423.png',
  '424': 'https://i.ibb.co/mVd1ZDTN/424.png',
  '425': 'https://i.ibb.co/gFzC4T9K/425.png',
  '426': 'https://i.ibb.co/FcbC7FY/426.png',
  '427': 'https://i.ibb.co/xKz4wSmQ/427.png',
  '428': 'https://i.ibb.co/s9BfGXTx/428.png',
  '429': 'https://i.ibb.co/Kp9PYXd3/429.png',
  '430': 'https://i.ibb.co/jZLZx2Df/430.png',
  '431': 'https://i.ibb.co/bj7CX6yL/431.png',
  '432': 'https://i.ibb.co/m5YD8bfT/432.png',
  '433': 'https://i.ibb.co/m5NnLDDt/433.png',
  '434': 'https://i.ibb.co/LXdVBrGZ/434.png',
  '435': 'https://i.ibb.co/jv370RkM/435.png',
  '436': 'https://i.ibb.co/tMJbTcHH/436.png',
  '437': 'https://i.ibb.co/xqBLRgFY/437.png',
  '438': 'https://i.ibb.co/6J8LyKHf/438.png',
  '439': 'https://i.ibb.co/270Kh6nn/439.png',
  '440': 'https://i.ibb.co/Pzzt3ZQN/440.png',
  '441': 'https://i.ibb.co/WpGgwqbk/441.png',
  '442': 'https://i.ibb.co/zhd1g695/442.png',
  '443': 'https://i.ibb.co/BHPhBzmc/443.png',
  '444': 'https://i.ibb.co/KxB9hzYq/444.png',
  '445': 'https://i.ibb.co/Q3wdnGzh/445.png',
  '446': 'https://i.ibb.co/vxNxyY2F/446.png',
  '447': 'https://i.ibb.co/vbCtnWm/447.png',
  '448': 'https://i.ibb.co/QFXFsF8x/448.png',
  '449': 'https://i.ibb.co/pH66xhb/449.png',
  '450': 'https://i.ibb.co/5XQWB5Jm/450.png',
  '451': 'https://i.ibb.co/qM9HFT7N/451.png',
  '452': 'https://i.ibb.co/Jj4JSLh6/452.png',
  '453': 'https://i.ibb.co/gF3GXWD4/453.png',
  '454': 'https://i.ibb.co/d4N4Wg4G/454.png',
  '455': 'https://i.ibb.co/Q7XFJF0C/455.png',
  '456': 'https://i.ibb.co/7Jv3kZ79/456.png',
  '457': 'https://i.ibb.co/Y4x8Nj69/457.png',
  '458': 'https://i.ibb.co/Vpk8XT33/458.png',
  '459': 'https://i.ibb.co/HfWD2CYb/459.png',
  '460': 'https://i.ibb.co/fBqZMtf/460.png',
  '461': 'https://i.ibb.co/9HK92Zxq/461.png',
  '462': 'https://i.ibb.co/zVBDbsbs/462.png',
  '463': 'https://i.ibb.co/gLSwBGVT/463.png',
  '464': 'https://i.ibb.co/vNdc7M6/464.png',
  '465': 'https://i.ibb.co/8nYMKjwn/465.png',
  '466': 'https://i.ibb.co/bMgJTnBy/466.png',
  '467': 'https://i.ibb.co/gZ1PYQGZ/467.png',
  '468': 'https://i.ibb.co/v6Rt0tbD/468.png',
  '469': 'https://i.ibb.co/DggWbcKm/469.png',
  '470': 'https://i.ibb.co/LXjykVpf/470.png',
  '471': 'https://i.ibb.co/tTSBJkY1/471.png',
  '472': 'https://i.ibb.co/8LZYWGbr/472.png',
  '473': 'https://i.ibb.co/hRhR4nD2/473.png',
  '474': 'https://i.ibb.co/BKz9Z3Dh/474.png',
  '475': 'https://i.ibb.co/3YMStvhF/475.png',
  '476': 'https://i.ibb.co/zTK8FCBT/476.png',
  '477': 'https://i.ibb.co/yFrjGJGV/477.png',
  '478': 'https://i.ibb.co/zj0M2cS/478.png',
  '479': 'https://i.ibb.co/DDPQLmW9/479.png',
  '480': 'https://i.ibb.co/7tZm9ph5/480.png',
  '481': 'https://i.ibb.co/LdSj5pcn/481.png',
  '482': 'https://i.ibb.co/4wnxwkHf/482.png',
  '483': 'https://i.ibb.co/203pQPFh/483.png',
  '484': 'https://i.ibb.co/9msQqX2P/484.png',
  '485': 'https://i.ibb.co/ynqvbWQL/485.png',
  '486': 'https://i.ibb.co/9kMjXpvF/486.png',
  '487': 'https://i.ibb.co/PZXhHhrM/487.png',
  '488': 'https://i.ibb.co/PsQL7jR4/488.png',
  '489': 'https://i.ibb.co/MypY1KmF/489.png',
  '490': 'https://i.ibb.co/TxMpQk4d/490.png',
  '491': 'https://i.ibb.co/DTyC5Ms/491.png',
  '492': 'https://i.ibb.co/YBJHMJ1v/492.png',
  '493': 'https://i.ibb.co/vx6S3nZG/493.png',
  '494': 'https://i.ibb.co/Kcs52JHy/494.png',
  '495': 'https://i.ibb.co/RkK4f7Zy/495.png',
  '496': 'https://i.ibb.co/3mdzRnpH/496.png',
  '497': 'https://i.ibb.co/6JgfQTpL/497.png',
  '498': 'https://i.ibb.co/gMsS1wh5/498.png',
  '499': 'https://i.ibb.co/G15dT7W/499.png',
  '500': 'https://i.ibb.co/1tRG0cKw/500.png',
  '501': 'https://i.ibb.co/DfM22wcS/501.png',
  '502': 'https://i.ibb.co/99gFDmtc/502.png',
  '503': 'https://i.ibb.co/NntH1hyY/503.png',
  '504': 'https://i.ibb.co/gZz8QdkF/504.png',
  '505': 'https://i.ibb.co/TM16wbzT/505.png',
  '506': 'https://i.ibb.co/KpVZ6PVn/506.png',
  '507': 'https://i.ibb.co/QvdSm3rj/507.png',
  '508': 'https://i.ibb.co/8L0bwHKN/508.png',
  '509': 'https://i.ibb.co/yBsmr1xc/509.png',
  '510': 'https://i.ibb.co/DSwpVKh/510.png',
  '511': 'https://i.ibb.co/v6Vh3syd/511.png',
  '512': 'https://i.ibb.co/8Lk7J3S7/512.png',
  '513': 'https://i.ibb.co/YBd7FN2B/513.png',
  '514': 'https://i.ibb.co/CszHskBh/514.png',
  '515': 'https://i.ibb.co/27d8qDp9/515.png',
  '516': 'https://i.ibb.co/mVCzR8W7/516.png',
  '517': 'https://i.ibb.co/39J7VgTt/517.png',
  '518': 'https://i.ibb.co/R4Gfz5bt/518.png',
  '519': 'https://i.ibb.co/Jw5WCngY/519.png',
  '520': 'https://i.ibb.co/yckxYSxX/520.png',
  '521': 'https://i.ibb.co/tpzXf0S4/521.png',
  '522': 'https://i.ibb.co/hJd6YgMq/522.png',
  '523': 'https://i.ibb.co/tpJ1WsT0/523.png',
  '524': 'https://i.ibb.co/x82FCqDR/524.png',
  '525': 'https://i.ibb.co/Kjxmwhh0/525.png',
  '526': 'https://i.ibb.co/6cwDRfgv/526.png',
  '527': 'https://i.ibb.co/PZwWv2RX/527.png',
  '528': 'https://i.ibb.co/pjSV39PD/528.png',
  '529': 'https://i.ibb.co/YCKFRjY/529.png',
  '530': 'https://i.ibb.co/39VQN8xH/530.png',
  '531': 'https://i.ibb.co/YTq8Y8Lc/531.png',
  '532': 'https://i.ibb.co/xq0McQ3S/532.png',
  '533': 'https://i.ibb.co/WNqPmDsZ/533.png',
  '534': 'https://i.ibb.co/rK2CZ7VT/534.png',
  '535': 'https://i.ibb.co/kVQPJNGt/535.png',
  '536': 'https://i.ibb.co/gbkqkc4C/536.png',
  '537': 'https://i.ibb.co/RdTQxzs/537.png',
  '538': 'https://i.ibb.co/p6bLcHQy/538.png',
  '539': 'https://i.ibb.co/5WsYqxgR/539.png',
  '540': 'https://i.ibb.co/PvH6d89d/540.png',
  '541': 'https://i.ibb.co/gZ7sQ4Yk/541.png',
  '542': 'https://i.ibb.co/1YjqXKmx/542.png',
  '543': 'https://i.ibb.co/Q7S8BLH3/543.png',
  '544': 'https://i.ibb.co/BVqvfnnN/544.png',
  '545': 'https://i.ibb.co/DJjtj9f/545.png',
  '546': 'https://i.ibb.co/tTRp06Zt/546.png',
  '547': 'https://i.ibb.co/V0zydMRz/547.png',
  '548': 'https://i.ibb.co/wNrQZ4Jk/548.png',
  '549': 'https://i.ibb.co/SDRwQPV9/549.png',
  '550': 'https://i.ibb.co/twhzvCTS/550.png',
  '551': 'https://i.ibb.co/h1MjBYYx/551.png',
  '552': 'https://i.ibb.co/3YPyd8MG/552.png',
  '553': 'https://i.ibb.co/6JLNz7Sw/553.png',
  '554': 'https://i.ibb.co/Kx7S3WNB/554.png',
  '555': 'https://i.ibb.co/ZR9Y3dqq/555.png',
  '556': 'https://i.ibb.co/yngrj44R/556.png',
  '557': 'https://i.ibb.co/F4qcGJRT/557.png',
  '558': 'https://i.ibb.co/TBhXPNH9/558.png',
  '559': 'https://i.ibb.co/MxhqsJTj/559.png',
  '560': 'https://i.ibb.co/PvbQ8kst/560.png',
  '561': 'https://i.ibb.co/qY0xNbbX/561.png',
  '562': 'https://i.ibb.co/xKFBzMw3/562.png',
  '563': 'https://i.ibb.co/G4s7NDH8/563.png',
  '564': 'https://i.ibb.co/Kx1gyJHz/564.png',
  '565': 'https://i.ibb.co/spMGrKrr/565.png',
  '566': 'https://i.ibb.co/rKBMcMNr/566.png',
  '567': 'https://i.ibb.co/DDv7V5gH/567.png',
  '568': 'https://i.ibb.co/xS6Vhc3V/568.png',
  '569': 'https://i.ibb.co/YFp2qPKR/569.png',
  '570': 'https://i.ibb.co/bgZWSgbc/570.png',
  '571': 'https://i.ibb.co/LD3Qkz9x/571.png',
  '572': 'https://i.ibb.co/x01q8Gm/572.png',
  '573': 'https://i.ibb.co/5WKX6bv7/573.png',
  '574': 'https://i.ibb.co/m53GFW1p/574.png',
  '575': 'https://i.ibb.co/d0FL3YTp/575.png',
  '576': 'https://i.ibb.co/21DPmMy8/576.png',
  '577': 'https://i.ibb.co/wZkwTg7N/577.png',
  '578': 'https://i.ibb.co/0NbpHHM/578.png',
  '579': 'https://i.ibb.co/Zzhv0Wz3/579.png',
  '580': 'https://i.ibb.co/0yNpLsfG/580.png',
  '581': 'https://i.ibb.co/cSRWpsG8/581.png',
  '582': 'https://i.ibb.co/7dhwrWxp/582.png',
  '583': 'https://i.ibb.co/21jmg8Nq/583.png',
  '584': 'https://i.ibb.co/JWdcZcdS/584.png',
  '585': 'https://i.ibb.co/FkVH9MT9/585.png',
  '586': 'https://i.ibb.co/0yN7DkTK/586.png',
  '587': 'https://i.ibb.co/Txhc2PL3/587.png',
  '588': 'https://i.ibb.co/PZWTnmFv/588.png',
  '589': 'https://i.ibb.co/FbL4tfQ3/589.png',
  '590': 'https://i.ibb.co/6JyWgqXW/590.png',
  '591': 'https://i.ibb.co/Xx4nk4KX/591.png',
  '592': 'https://i.ibb.co/cKZ1sB6R/592.png',
  '593': 'https://i.ibb.co/hFWBzBvf/593.png',
  '594': 'https://i.ibb.co/N6dRnTTL/594.png',
  '595': 'https://i.ibb.co/JwQhqLXb/595.png',
  '596': 'https://i.ibb.co/20721vnN/596.png',
  '597': 'https://i.ibb.co/6cv2VZ8z/597.png',
  '598': 'https://i.ibb.co/Kc1tq3Ry/598.png',
  '599': 'https://i.ibb.co/wZzMD0fb/599.png',
  '600': 'https://i.ibb.co/r2W9mN29/600.png',
  '601': 'https://i.ibb.co/VYL43CM7/601.png',
  '602': 'https://i.ibb.co/bMwpJ8qS/602.png',
  '603': 'https://i.ibb.co/m5t5Hmk4/603.png',
  '604': 'https://i.ibb.co/btx9HHC/604.png'
};

// Fallback image sources (used if imgbb fails)
const FALLBACK_SOURCES = [
  (page: string) => `/assets/quran-pages/${page}.png`,
  (page: string) => `https://quran-images.s3.amazonaws.com/pages/${page}.png`,
  (page: string) => `https://islamic-network.github.io/cdn/quran/images/page${page}.png`
];

// Make cache available globally for memory management
if (typeof window !== 'undefined') {
  window.imageCache = {
    clear: () => {
      imageCache.clear();
    }
  };
}

/**
 * Get the imgbb URL for a Quran page
 * This function maps page numbers to imgbb URLs
 * @param pageNumber The page number
 * @returns URL to the page image on imgbb
 */
function getImgbbUrl(pageNumber: number): string {
  const formattedPage = pageNumber.toString().padStart(3, '0');
  
  // If we have a direct mapping, use it
  if (IMGBB_URLS[formattedPage]) {
    return IMGBB_URLS[formattedPage];
  }
  
  // Otherwise, construct a URL based on the pattern
  // This is a fallback in case we don't have all 604 pages mapped
  return `https://i.ibb.co/quran-pages/${formattedPage}.png`;
}

/**
 * Get URL for a Quran page
 * @param pageNumber The page number
 * @param retryCount Current retry attempt
 * @returns URL to the page image
 */
export function getQuranImageUrl(pageNumber: number, retryCount: number = 0): string {
  // Format page number with leading zeros
  const formattedPage = pageNumber.toString().padStart(3, '0');
  
  // If we're on retry 0, use imgbb
  if (retryCount === 0) {
    return getImgbbUrl(pageNumber);
  }
  
  // Otherwise use fallbacks
  const fallbackIndex = (retryCount - 1) % FALLBACK_SOURCES.length;
  return FALLBACK_SOURCES[fallbackIndex](formattedPage);
}

/**
 * Preload a Quran page image
 * @param pageNumber The page number to preload
 * @returns A promise that resolves when the image is loaded
 */
export function preloadQuranPage(pageNumber: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Check if already in cache
    if (imageCache.has(pageNumber)) {
      resolve(imageCache.get(pageNumber)!);
      return;
    }

    // Create new image
    const img = new Image();
    
    img.onload = () => {
      // Add to cache
      imageCache.set(pageNumber, img);
      
      // Trim cache if needed
      if (imageCache.size > MAX_CACHE_SIZE) {
        // Remove oldest entry
        const firstKey = imageCache.keys().next().value;
        imageCache.delete(firstKey);
      }
      
      resolve(img);
    };
    
    img.onerror = () => {
      // Try fallback sources
      tryLoadFromFallbacks(pageNumber, 0)
        .then(img => {
          imageCache.set(pageNumber, img);
          resolve(img);
        })
        .catch(reject);
    };
    
    img.src = getQuranImageUrl(pageNumber);
  });
}

/**
 * Try loading an image from fallback sources
 * @param pageNumber The page number
 * @param sourceIndex Index of the fallback source to try
 * @returns A promise that resolves with the loaded image
 */
function tryLoadFromFallbacks(pageNumber: number, sourceIndex: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const formattedPage = pageNumber.toString().padStart(3, '0');
    
    if (sourceIndex >= FALLBACK_SOURCES.length) {
      reject(new Error(`Failed to load page ${formattedPage} from all fallback sources`));
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = () => {
      // Try next source
      tryLoadFromFallbacks(pageNumber, sourceIndex + 1)
        .then(resolve)
        .catch(reject);
    };
    
    img.src = FALLBACK_SOURCES[sourceIndex](formattedPage);
  });
}

/**
 * Preload a range of Quran pages
 * @param currentPage The current page number
 * @param range How many pages to preload in each direction
 */
export function preloadQuranPageRange(currentPage: number, range: number = 5): void {
  // Preload pages ahead
  for (let i = 1; i <= range; i++) {
    const nextPage = currentPage + i;
    if (nextPage <= 604) {
      preloadQuranPage(nextPage).catch(() => {
        // Silently fail for preloading
      });
    }
  }
  
  // Preload pages behind
  for (let i = 1; i <= Math.floor(range/2); i++) {
    const prevPage = currentPage - i;
    if (prevPage >= 1) {
      preloadQuranPage(prevPage).catch(() => {
        // Silently fail for preloading
      });
    }
  }
}

/**
 * Download and cache Quran pages for offline use
 * @param startPage First page to download
 * @param endPage Last page to download
 * @param progressCallback Callback for progress updates
 * @returns Promise that resolves when all pages are downloaded
 */
export async function downloadQuranPagesForOffline(
  startPage: number = 1,
  endPage: number = 10,
  progressCallback?: (current: number, total: number) => void
): Promise<{ success: number; failed: number }> {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    return { success: 0, failed: 0 };
  }
  
  const total = endPage - startPage + 1;
  let success = 0;
  let failed = 0;
  
  // Create directory if it doesn't exist
  try {
    await Filesystem.mkdir({
      path: 'quran-pages',
      directory: Directory.Documents,
      recursive: true
    });
  } catch (error) {
    // Directory might already exist, continue
    console.log('Directory creation error (might already exist):', error);
  }
  
  // Download each page
  for (let page = startPage; page <= endPage; page++) {
    try {
      const formattedPage = page.toString().padStart(3, '0');
      
      // Check if file already exists
      try {
        await Filesystem.stat({
          path: `quran-pages/${formattedPage}.png`,
          directory: Directory.Documents
        });
        
        // File exists, count as success and continue
        success++;
        if (progressCallback) {
          progressCallback(page - startPage + 1, total);
        }
        continue;
      } catch {
        // File doesn't exist, continue to download
      }
      
      // Try to fetch the image
      const response = await fetch(getQuranImageUrl(page));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page ${page}`);
      }
      
      const blob = await response.blob();
      
      // Convert blob to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Remove the data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert blob to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Save to filesystem
      await Filesystem.writeFile({
        path: `quran-pages/${formattedPage}.png`,
        data: base64Data,
        directory: Directory.Documents
      });
      
      success++;
    } catch (error) {
      console.error(`Error downloading page ${page}:`, error);
      failed++;
    }
    
    // Update progress
    if (progressCallback) {
      progressCallback(page - startPage + 1, total);
    }
  }
  
  return { success, failed };
}

/**
 * Check if a Quran page is available offline
 * @param pageNumber The page number to check
 * @returns Promise that resolves to true if the page is available offline
 */
export async function isQuranPageAvailableOffline(pageNumber: number): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }
  
  try {
    const formattedPage = pageNumber.toString().padStart(3, '0');
    
    await Filesystem.stat({
      path: `quran-pages/${formattedPage}.png`,
      directory: Directory.Documents
    });
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the URL for an offline Quran page
 * @param pageNumber The page number
 * @returns Promise that resolves to the URL of the offline page
 */
export async function getOfflineQuranPageUrl(pageNumber: number): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }
  
  try {
    const formattedPage = pageNumber.toString().padStart(3, '0');
    
    const fileInfo = await Filesystem.stat({
      path: `quran-pages/${formattedPage}.png`,
      directory: Directory.Documents
    });
    
    if (!fileInfo) {
      return null;
    }
    
    const { uri } = await Filesystem.getUri({
      path: `quran-pages/${formattedPage}.png`,
      directory: Directory.Documents
    });
    
    return uri;
  } catch {
    return null;
  }
}

/**
 * Clear the image cache
 */
export function clearQuranImageCache(): void {
  imageCache.clear();
}

/**
 * Force reload an image in the cache
 * @param pageNumber The page number to reload
 */
export function reloadQuranPage(pageNumber: number): void {
  // Remove from cache
  imageCache.delete(pageNumber);
  
  // Preload again
  preloadQuranPage(pageNumber).catch(console.error);
}
