package com.ebizimba.islam;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

public class QuranPageDownloader {
    private static final String TAG = "QuranPageDownloader";
    private final Context context;
    private DownloadListener listener;
    private boolean isDownloading = false;

    public interface DownloadListener {
        void onProgressUpdate(int current, int total);
        void onDownloadComplete(int success, int failed);
        void onError(String error);
    }

    public QuranPageDownloader(Context context) {
        this.context = context;
    }

    public void setListener(DownloadListener listener) {
        this.listener = listener;
    }

    public boolean isDownloading() {
        return isDownloading;
    }

    public void downloadPages(int startPage, int endPage) {
        if (isDownloading) {
            if (listener != null) {
                listener.onError("Download already in progress");
            }
            return;
        }

        if (startPage < 1 || endPage > 604 || startPage > endPage) {
            if (listener != null) {
                listener.onError("Invalid page range");
            }
            return;
        }

        new DownloadPagesTask().execute(startPage, endPage);
    }

    private class DownloadPagesTask extends AsyncTask<Integer, Integer, DownloadResult> {
        @Override
        protected void onPreExecute() {
            isDownloading = true;
        }

        @Override
        protected DownloadResult doInBackground(Integer... params) {
            int startPage = params[0];
            int endPage = params[1];
            int total = endPage - startPage + 1;
            int success = 0;
            int failed = 0;
            List<Integer> successPages = new ArrayList<>();

            // Create directory if it doesn't exist
            File quranDir = new File(context.getFilesDir(), "quran-pages");
            if (!quranDir.exists()) {
                quranDir.mkdirs();
            }

            for (int page = startPage; page <= endPage; page++) {
                // Format page number with leading zeros
                String formattedPage = String.format("%03d", page);
                
                // Check if file already exists
                File pageFile = new File(quranDir, formattedPage + ".png");
                if (pageFile.exists()) {
                    success++;
                    successPages.add(page);
                    publishProgress(page - startPage + 1, total);
                    continue;
                }

                // Try to download the page
                try {
                    // First try imgbb URL
                    String imgbbUrl = getImgbbUrl(formattedPage);
                    boolean downloaded = downloadFile(imgbbUrl, pageFile);
                    
                    // If imgbb fails, try fallback URLs
                    if (!downloaded) {
                        String fallbackUrl = "https://quran-images.s3.amazonaws.com/pages/" + formattedPage + ".png";
                        downloaded = downloadFile(fallbackUrl, pageFile);
                        
                        if (!downloaded) {
                            String secondFallbackUrl = "https://islamic-network.github.io/cdn/quran/images/page" + formattedPage + ".png";
                            downloaded = downloadFile(secondFallbackUrl, pageFile);
                        }
                    }
                    
                    if (downloaded) {
                        success++;
                        successPages.add(page);
                    } else {
                        failed++;
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error downloading page " + page, e);
                    failed++;
                }
                
                publishProgress(page - startPage + 1, total);
            }

            return new DownloadResult(success, failed, successPages);
        }

        @Override
        protected void onProgressUpdate(Integer... values) {
            if (listener != null) {
                listener.onProgressUpdate(values[0], values[1]);
            }
        }

        @Override
        protected void onPostExecute(DownloadResult result) {
            isDownloading = false;
            if (listener != null) {
                listener.onDownloadComplete(result.success, result.failed);
            }
        }
    }

    private String getImgbbUrl(String formattedPage) {
        // Map of all page numbers to their imgbb URLs
        switch (formattedPage) {
            case "001": return "https://i.ibb.co/5XpKN8pM/001.png";
            case "002": return "https://i.ibb.co/ks0cmb3d/002.png";
            case "003": return "https://i.ibb.co/LqJ9Y9L/003.png";
            case "004": return "https://i.ibb.co/kV3nRpSL/004.png";
            case "005": return "https://i.ibb.co/LdbNggW9/005.png";
            case "006": return "https://i.ibb.co/b5NkwP53/006.png";
            case "007": return "https://i.ibb.co/1fVtpQWW/007.png";
            case "008": return "https://i.ibb.co/x8rqY2Q0/008.png";
            case "009": return "https://i.ibb.co/HLrD2QJV/009.png";
            case "010": return "https://i.ibb.co/Gvx6NyKK/010.png";
            case "011": return "https://i.ibb.co/LXbMfRP7/011.png";
            case "012": return "https://i.ibb.co/Jw226R4B/012.png";
            case "013": return "https://i.ibb.co/mVYHG1BB/013.png";
            case "014": return "https://i.ibb.co/YFPYbsrD/014.png";
            case "015": return "https://i.ibb.co/0y3tLsjZ/015.png";
            case "016": return "https://i.ibb.co/dwWsGbsp/016.png";
            case "017": return "https://i.ibb.co/6zKkQBY/017.png";
            case "018": return "https://i.ibb.co/8ngh6qPW/018.png";
            case "019": return "https://i.ibb.co/B5VYTfGG/019.png";
            case "020": return "https://i.ibb.co/ymMXscdc/020.png";
            case "021": return "https://i.ibb.co/8LL9vhCz/021.png";
            case "022": return "https://i.ibb.co/WvNm0Wfy/022.png";
            case "023": return "https://i.ibb.co/qLMnKZsP/023.png";
            case "024": return "https://i.ibb.co/PGLtq6Fh/024.png";
            case "025": return "https://i.ibb.co/R4jXrpV0/025.png";
            case "026": return "https://i.ibb.co/M5RnS5MQ/026.png";
            case "027": return "https://i.ibb.co/NdZ74NkB/027.png";
            case "028": return "https://i.ibb.co/Y7C6LZRR/028.png";
            case "029": return "https://i.ibb.co/4wTQRCPB/029.png";
            case "030": return "https://i.ibb.co/YBrkJjC8/030.png";
            case "031": return "https://i.ibb.co/3y5WN85T/031.png";
            case "032": return "https://i.ibb.co/RGyH15Zx/032.png";
            case "033": return "https://i.ibb.co/r2DFRkbm/033.png";
            case "034": return "https://i.ibb.co/B2NS6wmS/034.png";
            case "035": return "https://i.ibb.co/DHNsq0p7/035.png";
            case "036": return "https://i.ibb.co/zWwxn5j7/036.png";
            case "037": return "https://i.ibb.co/23pN9dkS/037.png";
            case "038": return "https://i.ibb.co/j9rJvrpz/038.png";
            case "039": return "https://i.ibb.co/Cszzgkzj/039.png";
            case "040": return "https://i.ibb.co/jv893XPy/040.png";
            case "041": return "https://i.ibb.co/3mBgKJB9/041.png";
            case "042": return "https://i.ibb.co/Y4QYJqQ9/042.png";
            case "043": return "https://i.ibb.co/4n77XsFt/043.png";
            case "044": return "https://i.ibb.co/0j2XtTNb/044.png";
            case "045": return "https://i.ibb.co/7wpXpmb/045.png";
            case "046": return "https://i.ibb.co/p66dG3ZT/046.png";
            case "047": return "https://i.ibb.co/xqzZW6R4/047.png";
            case "048": return "https://i.ibb.co/Pv29Wnd0/048.png";
            case "049": return "https://i.ibb.co/9kzDcXb5/049.png";
            case "050": return "https://i.ibb.co/qYScF1qX/050.png";
            case "051": return "https://i.ibb.co/ycB3gDk8/051.png";
            case "052": return "https://i.ibb.co/TDkv84Gj/052.png";
            case "053": return "https://i.ibb.co/9kSLWP6N/053.png";
            case "054": return "https://i.ibb.co/LdDtxGBM/054.png";
            case "055": return "https://i.ibb.co/ksCJHNm0/055.png";
            case "056": return "https://i.ibb.co/Tq1bP8LG/056.png";
            case "057": return "https://i.ibb.co/pv6PNY3Z/057.png";
            case "058": return "https://i.ibb.co/kTKV9H5/058.png";
            case "059": return "https://i.ibb.co/zHLCpJ1C/059.png";
            case "060": return "https://i.ibb.co/gMHzfzGj/060.png";
            case "061": return "https://i.ibb.co/HTHyjTy8/061.png";
            case "062": return "https://i.ibb.co/N2wPLPM6/062.png";
            case "063": return "https://i.ibb.co/q3NhMqtP/063.png";
            case "064": return "https://i.ibb.co/d0RX5Qf2/064.png";
            case "065": return "https://i.ibb.co/q3BRcCJH/065.png";
            case "066": return "https://i.ibb.co/DgVR1xZW/066.png";
            case "067": return "https://i.ibb.co/TMV4yhKY/067.png";
            case "068": return "https://i.ibb.co/tTDLshnf/068.png";
            case "069": return "https://i.ibb.co/Xk3RkfMg/069.png";
            case "070": return "https://i.ibb.co/ksgvzgyH/070.png";
            case "071": return "https://i.ibb.co/Yzf8t4z/071.png";
            case "072": return "https://i.ibb.co/ZRvbMBth/072.png";
            case "073": return "https://i.ibb.co/5XNcT72f/073.png";
            case "074": return "https://i.ibb.co/C32kk5St/074.png";
            case "075": return "https://i.ibb.co/MynSStmx/075.png";
            case "076": return "https://i.ibb.co/cKh1KZ34/076.png";
            case "077": return "https://i.ibb.co/vC0DMzsr/077.png";
            case "078": return "https://i.ibb.co/G3v39v3R/078.png";
            case "079": return "https://i.ibb.co/1JZ7HLXk/079.png";
            case "080": return "https://i.ibb.co/xKBMdsw0/080.png";
            case "081": return "https://i.ibb.co/PLhGY2M/081.png";
            case "082": return "https://i.ibb.co/s9xQmtdC/082.png";
            case "083": return "https://i.ibb.co/svp2MPtb/083.png";
            case "084": return "https://i.ibb.co/nMNKFFrf/084.png";
            case "085": return "https://i.ibb.co/zHR62C7K/085.png";
            case "086": return "https://i.ibb.co/HLmZBrLP/086.png";
            case "087": return "https://i.ibb.co/hT62zR4/087.png";
            case "088": return "https://i.ibb.co/CsNvf8Ng/088.png";
            case "089": return "https://i.ibb.co/5grdDMFR/089.png";
            case "090": return "https://i.ibb.co/RGffWsNb/090.png";
            case "091": return "https://i.ibb.co/j9z4y5HW/091.png";
            case "092": return "https://i.ibb.co/d0bh4zj9/092.png";
            case "093": return "https://i.ibb.co/4w6DMksr/093.png";
            case "094": return "https://i.ibb.co/Ng1TRBbZ/094.png";
            case "095": return "https://i.ibb.co/4ngP4rhN/095.png";
            case "096": return "https://i.ibb.co/QvHPJ6JJ/096.png";
            case "097": return "https://i.ibb.co/93GHNVbY/097.png";
            case "098": return "https://i.ibb.co/MkBVBgtF/098.png";
            case "099": return "https://i.ibb.co/1csD0SP/099.png";
            case "100": return "https://i.ibb.co/HfnjbbCj/100.png";
            case "101": return "https://i.ibb.co/yngMYwdY/101.png";
            case "102": return "https://i.ibb.co/GLLCzHK/102.png";
            case "103": return "https://i.ibb.co/XkrzKZdT/103.png";
            case "104": return "https://i.ibb.co/LDMdTsq7/104.png";
            case "105": return "https://i.ibb.co/hR9RVJJ5/105.png";
            case "106": return "https://i.ibb.co/vxxJBvYq/106.png";
            case "107": return "https://i.ibb.co/20P614GW/107.png";
            case "108": return "https://i.ibb.co/DgDtB7kb/108.png";
            case "109": return "https://i.ibb.co/wFTGs1j9/109.png";
            case "110": return "https://i.ibb.co/B2XDZjXt/110.png";
            case "111": return "https://i.ibb.co/DfzZyJjC/111.png";
            case "112": return "https://i.ibb.co/jvqT3bTf/112.png";
            case "113": return "https://i.ibb.co/4wz8DdHs/113.png";
            case "114": return "https://i.ibb.co/fVKXx5ym/114.png";
            case "115": return "https://i.ibb.co/h191NMDp/115.png";
            case "116": return "https://i.ibb.co/ds6FT02f/116.png";
            case "117": return "https://i.ibb.co/WNstkMTf/117.png";
            case "118": return "https://i.ibb.co/fV6GGggD/118.png";
            case "119": return "https://i.ibb.co/5XyhLcK0/119.png";
            case "120": return "https://i.ibb.co/kg1kgsN7/120.png";
            case "121": return "https://i.ibb.co/QFhbKMwY/121.png";
            case "122": return "https://i.ibb.co/KjmMyCYk/122.png";
            case "123": return "https://i.ibb.co/6RQyKKKk/123.png";
            case "124": return "https://i.ibb.co/LDxg8Kwy/124.png";
            case "125": return "https://i.ibb.co/4gFJVRY0/125.png";
            case "126": return "https://i.ibb.co/33QYr06/126.png";
            case "127": return "https://i.ibb.co/B5JLXppB/127.png";
            case "128": return "https://i.ibb.co/k2csd5w5/128.png";
            case "129": return "https://i.ibb.co/nsVXkvfc/129.png";
            case "130": return "https://i.ibb.co/QFJXSfzx/130.png";
            case "131": return "https://i.ibb.co/BHyKntp5/131.png";
            case "132": return "https://i.ibb.co/n85BCMR0/132.png";
            case "133": return "https://i.ibb.co/2Ym5nmRh/133.png";
            case "134": return "https://i.ibb.co/GfP1j2KD/134.png";
            case "135": return "https://i.ibb.co/6RkZ9gTM/135.png";
            case "136": return "https://i.ibb.co/C31xRpGB/136.png";
            case "137": return "https://i.ibb.co/yBqsPtrZ/137.png";
            case "138": return "https://i.ibb.co/TMD5qXvs/138.png";
            case "139": return "https://i.ibb.co/vCJKVbnN/139.png";
            case "140": return "https://i.ibb.co/hJPSJ3y1/140.png";
            case "141": return "https://i.ibb.co/TBTh35FZ/141.png";
            case "142": return "https://i.ibb.co/1fHwxCCS/142.png";
            case "143": return "https://i.ibb.co/RTVdzc6K/143.png";
            case "144": return "https://i.ibb.co/R8rs0Wh/144.png";
            case "145": return "https://i.ibb.co/HLXY7Y4D/145.png";
            case "146": return "https://i.ibb.co/pjdZ320f/146.png";
            case "147": return "https://i.ibb.co/d0tkZBr3/147.png";
            case "148": return "https://i.ibb.co/67Fdf7WC/148.png";
            case "149": return "https://i.ibb.co/1fH4vT4v/149.png";
            case "150": return "https://i.ibb.co/QF9nhgrQ/150.png";
            case "151": return "https://i.ibb.co/Cpx9tGQh/151.png";
            case "152": return "https://i.ibb.co/WWqkjS03/152.png";
            case "153": return "https://i.ibb.co/23z4d50K/153.png";
            case "154": return "https://i.ibb.co/2108Q3N6/154.png";
            case "155": return "https://i.ibb.co/xq8vwm08/155.png";
            case "156": return "https://i.ibb.co/pYWn4F3/156.png";
            case "157": return "https://i.ibb.co/JRqhvp1p/157.png";
            case "158": return "https://i.ibb.co/Y4RCLrt0/158.png";
            case "159": return "https://i.ibb.co/chcqYb79/159.png";
            case "160": return "https://i.ibb.co/5hRBgr2h/160.png";
            case "161": return "https://i.ibb.co/4nnn69dW/161.png";
            case "162": return "https://i.ibb.co/3ySW87NN/162.png";
            case "163": return "https://i.ibb.co/23RsDm5W/163.png";
            case "164": return "https://i.ibb.co/cc1DbY9S/164.png";
            case "165": return "https://i.ibb.co/7tvd2Lyy/165.png";
            case "166": return "https://i.ibb.co/27507fHh/166.png";
            case "167": return "https://i.ibb.co/DBvzHSL/167.png";
            case "168": return "https://i.ibb.co/S73p160m/168.png";
            case "169": return "https://i.ibb.co/tTR5K3Jz/169.png";
            case "170": return "https://i.ibb.co/99RKZ3X3/170.png";
            case "171": return "https://i.ibb.co/twzC261z/171.png";
            case "172": return "https://i.ibb.co/jkzsCzFh/172.png";
            case "173": return "https://i.ibb.co/6J44R1wT/173.png";
            case "174": return "https://i.ibb.co/C3PNVkDQ/174.png";
            case "175": return "https://i.ibb.co/zhfPgSDd/175.png";
            case "176": return "https://i.ibb.co/jPz7kHnS/176.png";
            case "177": return "https://i.ibb.co/S4xZb38X/177.png";
            case "178": return "https://i.ibb.co/sJkgXMpc/178.png";
            case "179": return "https://i.ibb.co/7db0Zw12/179.png";
            case "180": return "https://i.ibb.co/fdHgZ4yj/180.png";
            case "181": return "https://i.ibb.co/gFHBPVx1/181.png";
            case "182": return "https://i.ibb.co/1tszj6S3/182.png";
            case "183": return "https://i.ibb.co/1GyNZmw7/183.png";
            case "184": return "https://i.ibb.co/nNGRXx7v/184.png";
            case "185": return "https://i.ibb.co/FLvb9wty/185.png";
            case "186": return "https://i.ibb.co/wNwMJt9R/186.png";
            case "187": return "https://i.ibb.co/r2ThkYz0/187.png";
            case "188": return "https://i.ibb.co/zVvzNYk5/188.png";
            case "189": return "https://i.ibb.co/DdZFBpF/189.png";
            case "190": return "https://i.ibb.co/d4sYrv3N/190.png";
            case "191": return "https://i.ibb.co/HLZ5by8q/191.png";
            case "192": return "https://i.ibb.co/JFkkrh6D/192.png";
            case "193": return "https://i.ibb.co/h1D8HnjX/193.png";
            case "194": return "https://i.ibb.co/fGxFsk4W/194.png";
            case "195": return "https://i.ibb.co/nxf0b4s/195.png";
            case "196": return "https://i.ibb.co/8Djjc1Vf/196.png";
            case "197": return "https://i.ibb.co/VYdVw2B3/197.png";
            case "198": return "https://i.ibb.co/tn7QDhW/198.png";
            case "199": return "https://i.ibb.co/pB89zxJ4/199.png";
            case "200": return "https://i.ibb.co/Y79pHpjN/200.png";
            case "201": return "https://i.ibb.co/Fb8b8rrb/201.png";
            case "202": return "https://i.ibb.co/MXnz3Qv/202.png";
            case "203": return "https://i.ibb.co/3Y0nJ58f/203.png";
            case "204": return "https://i.ibb.co/4wkB7FMc/204.png";
            case "205": return "https://i.ibb.co/3J2dCmW/205.png";
            case "206": return "https://i.ibb.co/k6sqrnps/206.png";
            case "207": return "https://i.ibb.co/Zp1VJ68K/207.png";
            case "208": return "https://i.ibb.co/SXPLQwdk/208.png";
            case "209": return "https://i.ibb.co/7xr0XBkr/209.png";
            case "210": return "https://i.ibb.co/KcRQMDXK/210.png";
            case "211": return "https://i.ibb.co/qLk1sLf6/211.png";
            case "212": return "https://i.ibb.co/8gdVHDMJ/212.png";
            case "213": return "https://i.ibb.co/gLqcHmgv/213.png";
            case "214": return "https://i.ibb.co/S77FB84h/214.png";
            case "215": return "https://i.ibb.co/Q7ygHxhQ/215.png";
            case "216": return "https://i.ibb.co/3mzmft9F/216.png";
            case "217": return "https://i.ibb.co/21gSVg0x/217.png";
            case "218": return "https://i.ibb.co/cqVgF3y/218.png";
            case "219": return "https://i.ibb.co/4n9Snp9b/219.png";
            case "220": return "https://i.ibb.co/v6gFKxDR/220.png";
            case "221": return "https://i.ibb.co/1tb8t10h/221.png";
            case "222": return "https://i.ibb.co/LdSnNbmh/222.png";
            case "223": return "https://i.ibb.co/s9Z4SMLr/223.png";
            case "224": return "https://i.ibb.co/NgVM2mYB/224.png";
            case "225": return "https://i.ibb.co/rGLXsv1m/225.png";
            case "226": return "https://i.ibb.co/DfHrJDJN/226.png";
            case "227": return "https://i.ibb.co/d4Whbc95/227.png";
            case "228": return "https://i.ibb.co/svvKL97r/228.png";
            case "229": return "https://i.ibb.co/fYMMBZrw/229.png";
            case "230": return "https://i.ibb.co/FL0KBJ73/230.png";
            case "231": return "https://i.ibb.co/84fg1f1X/231.png";
            case "232": return "https://i.ibb.co/35NcZYHS/232.png";
            case "233": return "https://i.ibb.co/zT4QRsBY/233.png";
            case "234": return "https://i.ibb.co/VY5WQK7q/234.png";
            case "235": return "https://i.ibb.co/60ch0pY0/235.png";
            case "236": return "https://i.ibb.co/v41JJW12/236.png";
            case "237": return "https://i.ibb.co/MxdCPHWJ/237.png";
            case "238": return "https://i.ibb.co/67PSC67C/238.png";
            case "239": return "https://i.ibb.co/jPfm4QvH/239.png";
            case "240": return "https://i.ibb.co/CKTRTQyS/240.png";
            case "241": return "https://i.ibb.co/WvQKNvcN/241.png";
            case "242": return "https://i.ibb.co/PvKf04FM/242.png";
            case "243": return "https://i.ibb.co/TDtPhGGZ/243.png";
            case "244": return "https://i.ibb.co/Mx0QXMpT/244.png";
            case "245": return "https://i.ibb.co/0jyt7nGS/245.png";
            case "246": return "https://i.ibb.co/zhCBtz3Y/246.png";
            case "247": return "https://i.ibb.co/Wv1vnL8B/247.png";
            case "248": return "https://i.ibb.co/6Rp9ZMKt/248.png";
            case "249": return "https://i.ibb.co/Gf4PkKbp/249.png";
            case "250": return "https://i.ibb.co/CKgQ2NJT/250.png";
            case "251": return "https://i.ibb.co/J9pxVDn/251.png";
            case "252": return "https://i.ibb.co/spKj8Hvg/252.png";
            case "253": return "https://i.ibb.co/rf7RWB9r/253.png";
            case "254": return "https://i.ibb.co/rK9qg0PR/254.png";
            case "255": return "https://i.ibb.co/TDGZQQH3/255.png";
            case "256": return "https://i.ibb.co/svV1HLBt/256.png";
            case "257": return "https://i.ibb.co/v4RQDY0H/257.png";
            case "258": return "https://i.ibb.co/CKLdN9Wq/258.png";
            case "259": return "https://i.ibb.co/mrxQdyZt/259.png";
            case "260": return "https://i.ibb.co/d0yJ0mGC/260.png";
            case "261": return "https://i.ibb.co/5W3P60px/261.png";
            case "262": return "https://i.ibb.co/67Xr188L/262.png";
            case "263": return "https://i.ibb.co/QvDwqgCs/263.png";
            case "264": return "https://i.ibb.co/NgJZk914/264.png";
            case "265": return "https://i.ibb.co/gbcLhhkR/265.png";
            case "266": return "https://i.ibb.co/7tnFhXBq/266.png";
            case "267": return "https://i.ibb.co/0pjWN2sv/267.png";
            case "268": return "https://i.ibb.co/35HXcktt/268.png";
            case "269": return "https://i.ibb.co/v6fW2s1w/269.png";
            case "270": return "https://i.ibb.co/Fk2WhBqL/270.png";
            case "271": return "https://i.ibb.co/cScrMRgK/271.png";
            case "272": return "https://i.ibb.co/4RNYJhm6/272.png";
            case "273": return "https://i.ibb.co/0R346GbG/273.png";
            case "274": return "https://i.ibb.co/Vkc6zWq/274.png";
            case "275": return "https://i.ibb.co/27hXKhZk/275.png";
            case "276": return "https://i.ibb.co/zWybgF1p/276.png";
            case "277": return "https://i.ibb.co/pjxRWhGq/277.png";
            case "278": return "https://i.ibb.co/4R65Xm8P/278.png";
            case "279": return "https://i.ibb.co/FrwWBMQ/279.png";
            case "280": return "https://i.ibb.co/hRxB1tVh/280.png";
            case "281": return "https://i.ibb.co/jkY2Q0zV/281.png";
            case "282": return "https://i.ibb.co/WNtVBLCv/282.png";
            case "283": return "https://i.ibb.co/bkzpMRR/283.png";
            case "284": return "https://i.ibb.co/XxBPn09M/284.png";
            case "285": return "https://i.ibb.co/JRZPmm2F/285.png";
            case "286": return "https://i.ibb.co/mrpvPpGZ/286.png";
            case "287": return "https://i.ibb.co/vx64JmT0/287.png";
            case "288": return "https://i.ibb.co/8g9L3q2m/288.png";
            case "289": return "https://i.ibb.co/vCf5kFyj/289.png";
            case "290": return "https://i.ibb.co/xK2XFRRv/290.png";
            case "291": return "https://i.ibb.co/cKBxxqg1/291.png";
            case "292": return "https://i.ibb.co/B2128JJB/292.png";
            case "293": return "https://i.ibb.co/B2BJBc1z/293.png";
            case "294": return "https://i.ibb.co/4g5kwGh3/294.png";
            case "295": return "https://i.ibb.co/xt8vP36p/295.png";
            case "296": return "https://i.ibb.co/fzNQr8wW/296.png";
            case "297": return "https://i.ibb.co/pBD6yZXR/297.png";
            case "298": return "https://i.ibb.co/9mGkBsQs/298.png";
            case "299": return "https://i.ibb.co/k66FgHq5/299.png";
            case "300": return "https://i.ibb.co/4wBY71PB/300.png";
            case "301": return "https://i.ibb.co/MwZSBKJ/301.png";
            case "302": return "https://i.ibb.co/39wPnykW/302.png";
            case "303": return "https://i.ibb.co/fzxC9vYC/303.png";
            case "304": return "https://i.ibb.co/4w0TH55q/304.png";
            case "305": return "https://i.ibb.co/q39pDPfr/305.png";
            case "306": return "https://i.ibb.co/Xf0vsrg4/306.png";
            case "307": return "https://i.ibb.co/XfTbYd4L/307.png";
            case "308": return "https://i.ibb.co/VprPDyxf/308.png";
            case "309": return "https://i.ibb.co/ZRj3B6YK/309.png";
            case "310": return "https://i.ibb.co/7xr5rSJH/310.png";
            case "311": return "https://i.ibb.co/nq9DHVrL/311.png";
            case "312": return "https://i.ibb.co/PzF5pWXx/312.png";
            case "313": return "https://i.ibb.co/SDDcyxV6/313.png";
            case "314": return "https://i.ibb.co/zV576ZgC/314.png";
            case "315": return "https://i.ibb.co/39B7dp0k/315.png";
            case "316": return "https://i.ibb.co/hxVhZB0d/316.png";
            case "317": return "https://i.ibb.co/tTVFpT2B/317.png";
            case "318": return "https://i.ibb.co/Fk1rzMGk/318.png";
            case "319": return "https://i.ibb.co/3J6f0qK/319.png";
            case "320": return "https://i.ibb.co/MDph4zT8/320.png";
            case "321": return "https://i.ibb.co/pBTd0W2h/321.png";
            case "322": return "https://i.ibb.co/KjMGz7Dg/322.png";
            case "323": return "https://i.ibb.co/d4TWPFwR/323.png";
            case "324": return "https://i.ibb.co/hRVMXdfc/324.png";
            case "325": return "https://i.ibb.co/4Zk2P6Zc/325.png";
            case "326": return "https://i.ibb.co/0yyzrdd1/326.png";
            case "327": return "https://i.ibb.co/rRS1MRLw/327.png";
            case "328": return "https://i.ibb.co/20z2FSwR/328.png";
            case "329": return "https://i.ibb.co/Lzc7h4YG/329.png";
            case "330": return "https://i.ibb.co/d4Rw7HTc/330.png";
            case "331": return "https://i.ibb.co/Fkyy5mPN/331.png";
            case "332": return "https://i.ibb.co/n8QMHCxj/332.png";
            case "333": return "https://i.ibb.co/HfTyc8P0/333.png";
            case "334": return "https://i.ibb.co/dFmh6jg/334.png";
            case "335": return "https://i.ibb.co/MySzHDKF/335.png";
            case "336": return "https://i.ibb.co/Swp5VPdP/336.png";
            case "337": return "https://i.ibb.co/5h7Y1W0J/337.png";
            case "338": return "https://i.ibb.co/M5pMKR7Y/338.png";
            case "339": return "https://i.ibb.co/2Yv0PX1v/339.png";
            case "340": return "https://i.ibb.co/4ZJyyGV5/340.png";
            case "341": return "https://i.ibb.co/vxVSM6kG/341.png";
            case "342": return "https://i.ibb.co/0ykYCPvR/342.png";
            case "343": return "https://i.ibb.co/hNMSybQ/343.png";
            case "344": return "https://i.ibb.co/sdg7b6p7/344.png";
            case "345": return "https://i.ibb.co/vxsrsH9H/345.png";
            case "346": return "https://i.ibb.co/SXYT6GBD/346.png";
            case "347": return "https://i.ibb.co/v6LNqTky/347.png";
            case "348": return "https://i.ibb.co/hjdmyKy/348.png";
            case "349": return "https://i.ibb.co/fGLWRFRw/349.png";
            case "350": return "https://i.ibb.co/YTL1fhCH/350.png";
            case "351": return "https://i.ibb.co/WWZSqgj9/351.png";
            case "352": return "https://i.ibb.co/JWhNdP5F/352.png";
            case "353": return "https://i.ibb.co/35TKgN4f/353.png";
            case "354": return "https://i.ibb.co/dRVzHbR/354.png";
            case "355": return "https://i.ibb.co/R4S1J9rK/355.png";
            case "356": return "https://i.ibb.co/HDwpZbTp/356.png";
            case "357": return "https://i.ibb.co/KcdCzmsY/357.png";
            case "358": return "https://i.ibb.co/fYyBvXND/358.png";
            case "359": return "https://i.ibb.co/C3V7M48z/359.png";
            case "360": return "https://i.ibb.co/Zz1fVFkm/360.png";
            case "361": return "https://i.ibb.co/gL7vWS1s/361.png";
            case "362": return "https://i.ibb.co/DJz67sD/362.png";
            case "363": return "https://i.ibb.co/bjw19BdK/363.png";
            case "364": return "https://i.ibb.co/bMLrvwM9/364.png";
            case "365": return "https://i.ibb.co/PsTggsJh/365.png";
            case "366": return "https://i.ibb.co/kVs4hsPr/366.png";
            case "367": return "https://i.ibb.co/tPWddYGz/367.png";
            case "368": return "https://i.ibb.co/9kdbgQ7P/368.png";
            case "369": return "https://i.ibb.co/ZRqzbsKy/369.png";
            case "370": return "https://i.ibb.co/xKt4BQJC/370.png";
            case "371": return "https://i.ibb.co/Wv95ymL3/371.png";
            case "372": return "https://i.ibb.co/F4vPsZ7Z/372.png";
            case "373": return "https://i.ibb.co/H3LmjvW/373.png";
            case "374": return "https://i.ibb.co/pjc7JTnv/374.png";
            case "375": return "https://i.ibb.co/QvDy5Smy/375.png";
            case "376": return "https://i.ibb.co/TBmBqRRh/376.png";
            case "377": return "https://i.ibb.co/ccydtyhW/377.png";
            case "378": return "https://i.ibb.co/8T4HhsM/378.png";
            case "379": return "https://i.ibb.co/nNB2T3zK/379.png";
            case "380": return "https://i.ibb.co/84YbHkbd/380.png";
            case "381": return "https://i.ibb.co/rYQ67gN/381.png";
            case "382": return "https://i.ibb.co/NgVw18NH/382.png";
            case "383": return "https://i.ibb.co/W41NR367/383.png";
            case "384": return "https://i.ibb.co/gQd2j97/384.png";
            case "385": return "https://i.ibb.co/wFXMZWB7/385.png";
            case "386": return "https://i.ibb.co/8gL2hK0H/386.png";
            case "387": return "https://i.ibb.co/cj8Qwkq/387.png";
            case "388": return "https://i.ibb.co/3yQ6htgz/388.png";
            case "389": return "https://i.ibb.co/M5V6JhcF/389.png";
            case "390": return "https://i.ibb.co/PZXR2nbv/390.png";
            case "391": return "https://i.ibb.co/spp0V9rp/391.png";
            case "392": return "https://i.ibb.co/Y7dJvXPQ/392.png";
            case "393": return "https://i.ibb.co/Fb0MVZ7p/393.png";
            case "394": return "https://i.ibb.co/zYJwjPz/394.png";
            case "395": return "https://i.ibb.co/Lh9N3Rwy/395.png";
            case "396": return "https://i.ibb.co/Lh20NpM8/396.png";
            case "397": return "https://i.ibb.co/GQpWyk4S/397.png";
            case "398": return "https://i.ibb.co/Q3FTm0pr/398.png";
            case "399": return "https://i.ibb.co/My0yG7Gq/399.png";
            case "400": return "https://i.ibb.co/8DNRwKJM/400.png";
            case "401": return "https://i.ibb.co/TqnHgyZ5/401.png";
            case "402": return "https://i.ibb.co/93WSpwTn/402.png";
            case "403": return "https://i.ibb.co/VWn9rSB2/403.png";
            case "404": return "https://i.ibb.co/200BTcsc/404.png";
            case "405": return "https://i.ibb.co/Cpbn1PjG/405.png";
            case "406": return "https://i.ibb.co/gh16zBg/406.png";
            case "407": return "https://i.ibb.co/k26zjsyV/407.png";
            case "408": return "https://i.ibb.co/hbddJsf/408.png";
            case "409": return "https://i.ibb.co/mCdC7Fmg/409.png";
            case "410": return "https://i.ibb.co/Ldk1Bfbr/410.png";
            case "411": return "https://i.ibb.co/wm4jbwY/411.png";
            case "412": return "https://i.ibb.co/3mmpnD8S/412.png";
            case "413": return "https://i.ibb.co/5x21GNjh/413.png";
            case "414": return "https://i.ibb.co/chSpPZzM/414.png";
            case "415": return "https://i.ibb.co/nqXf6Nrq/415.png";
            case "416": return "https://i.ibb.co/NnxJCrdJ/416.png";
            case "417": return "https://i.ibb.co/v707ymY/417.png";
            case "418": return "https://i.ibb.co/MDwFHJz0/418.png";
            case "419": return "https://i.ibb.co/mKxpbQS/419.png";
            case "420": return "https://i.ibb.co/nNxTtBk2/420.png";
            case "421": return "https://i.ibb.co/GvQP0wz8/421.png";
            case "422": return "https://i.ibb.co/p6pyzPxx/422.png";
            case "423": return "https://i.ibb.co/B2QtKk30/423.png";
            case "424": return "https://i.ibb.co/mVd1ZDTN/424.png";
            case "425": return "https://i.ibb.co/gFzC4T9K/425.png";
            case "426": return "https://i.ibb.co/FcbC7FY/426.png";
            case "427": return "https://i.ibb.co/xKz4wSmQ/427.png";
            case "428": return "https://i.ibb.co/s9BfGXTx/428.png";
            case "429": return "https://i.ibb.co/Kp9PYXd3/429.png";
            case "430": return "https://i.ibb.co/jZLZx2Df/430.png";
            case "431": return "https://i.ibb.co/bj7CX6yL/431.png";
            case "432": return "https://i.ibb.co/m5YD8bfT/432.png";
            case "433": return "https://i.ibb.co/m5NnLDDt/433.png";
            case "434": return "https://i.ibb.co/LXdVBrGZ/434.png";
            case "435": return "https://i.ibb.co/jv370RkM/435.png";
            case "436": return "https://i.ibb.co/tMJbTcHH/436.png";
            case "437": return "https://i.ibb.co/xqBLRgFY/437.png";
            case "438": return "https://i.ibb.co/6J8LyKHf/438.png";
            case "439": return "https://i.ibb.co/270Kh6nn/439.png";
            case "440": return "https://i.ibb.co/Pzzt3ZQN/440.png";
            case "441": return "https://i.ibb.co/WpGgwqbk/441.png";
            case "442": return "https://i.ibb.co/zhd1g695/442.png";
            case "443": return "https://i.ibb.co/BHPhBzmc/443.png";
            case "444": return "https://i.ibb.co/KxB9hzYq/444.png";
            case "445": return "https://i.ibb.co/Q3wdnGzh/445.png";
            case "446": return "https://i.ibb.co/vxNxyY2F/446.png";
            case "447": return "https://i.ibb.co/vbCtnWm/447.png";
            case "448": return "https://i.ibb.co/QFXFsF8x/448.png";
            case "449": return "https://i.ibb.co/pH66xhb/449.png";
            case "450": return "https://i.ibb.co/5XQWB5Jm/450.png";
            case "451": return "https://i.ibb.co/qM9HFT7N/451.png";
            case "452": return "https://i.ibb.co/Jj4JSLh6/452.png";
            case "453": return "https://i.ibb.co/gF3GXWD4/453.png";
            case "454": return "https://i.ibb.co/d4N4Wg4G/454.png";
            case "455": return "https://i.ibb.co/Q7XFJF0C/455.png";
            case "456": return "https://i.ibb.co/7Jv3kZ79/456.png";
            case "457": return "https://i.ibb.co/Y4x8Nj69/457.png";
            case "458": return "https://i.ibb.co/Vpk8XT33/458.png";
            case "459": return "https://i.ibb.co/HfWD2CYb/459.png";
            case "460": return "https://i.ibb.co/fBqZMtf/460.png";
            case "461": return "https://i.ibb.co/9HK92Zxq/461.png";
            case "462": return "https://i.ibb.co/zVBDbsbs/462.png";
            case "463": return "https://i.ibb.co/gLSwBGVT/463.png";
            case "464": return "https://i.ibb.co/vNdc7M6/464.png";
            case "465": return "https://i.ibb.co/8nYMKjwn/465.png";
            case "466": return "https://i.ibb.co/bMgJTnBy/466.png";
            case "467": return "https://i.ibb.co/gZ1PYQGZ/467.png";
            case "468": return "https://i.ibb.co/v6Rt0tbD/468.png";
            case "469": return "https://i.ibb.co/DggWbcKm/469.png";
            case "470": return "https://i.ibb.co/LXjykVpf/470.png";
            case "471": return "https://i.ibb.co/tTSBJkY1/471.png";
            case "472": return "https://i.ibb.co/8LZYWGbr/472.png";
            case "473": return "https://i.ibb.co/hRhR4nD2/473.png";
            case "474": return "https://i.ibb.co/BKz9Z3Dh/474.png";
            case "475": return "https://i.ibb.co/3YMStvhF/475.png";
            case "476": return "https://i.ibb.co/zTK8FCBT/476.png";
            case "477": return "https://i.ibb.co/yFrjGJGV/477.png";
            case "478": return "https://i.ibb.co/zj0M2cS/478.png";
            case "479": return "https://i.ibb.co/DDPQLmW9/479.png";
            case "480": return "https://i.ibb.co/7tZm9ph5/480.png";
            case "481": return "https://i.ibb.co/LdSj5pcn/481.png";
            case "482": return "https://i.ibb.co/4wnxwkHf/482.png";
            case "483": return "https://i.ibb.co/203pQPFh/483.png";
            case "484": return "https://i.ibb.co/9msQqX2P/484.png";
            case "485": return "https://i.ibb.co/ynqvbWQL/485.png";
            case "486": return "https://i.ibb.co/9kMjXpvF/486.png";
            case "487": return "https://i.ibb.co/PZXhHhrM/487.png";
            case "488": return "https://i.ibb.co/PsQL7jR4/488.png";
            case "489": return "https://i.ibb.co/MypY1KmF/489.png";
            case "490": return "https://i.ibb.co/TxMpQk4d/490.png";
            case "491": return "https://i.ibb.co/DTyC5Ms/491.png";
            case "492": return "https://i.ibb.co/YBJHMJ1v/492.png";
            case "493": return "https://i.ibb.co/vx6S3nZG/493.png";
            case "494": return "https://i.ibb.co/Kcs52JHy/494.png";
            case "495": return "https://i.ibb.co/RkK4f7Zy/495.png";
            case "496": return "https://i.ibb.co/3mdzRnpH/496.png";
            case "497": return "https://i.ibb.co/6JgfQTpL/497.png";
            case "498": return "https://i.ibb.co/gMsS1wh5/498.png";
            case "499": return "https://i.ibb.co/G15dT7W/499.png";
            case "500": return "https://i.ibb.co/1tRG0cKw/500.png";
            case "501": return "https://i.ibb.co/DfM22wcS/501.png";
            case "502": return "https://i.ibb.co/99gFDmtc/502.png";
            case "503": return "https://i.ibb.co/NntH1hyY/503.png";
            case "504": return "https://i.ibb.co/gZz8QdkF/504.png";
            case "505": return "https://i.ibb.co/TM16wbzT/505.png";
            case "506": return "https://i.ibb.co/KpVZ6PVn/506.png";
            case "507": return "https://i.ibb.co/QvdSm3rj/507.png";
            case "508": return "https://i.ibb.co/8L0bwHKN/508.png";
            case "509": return "https://i.ibb.co/yBsmr1xc/509.png";
            case "510": return "https://i.ibb.co/DSwpVKh/510.png";
            case "511": return "https://i.ibb.co/v6Vh3syd/511.png";
            case "512": return "https://i.ibb.co/8Lk7J3S7/512.png";
            case "513": return "https://i.ibb.co/YBd7FN2B/513.png";
            case "514": return "https://i.ibb.co/CszHskBh/514.png";
            case "515": return "https://i.ibb.co/27d8qDp9/515.png";
            case "516": return "https://i.ibb.co/mVCzR8W7/516.png";
            case "517": return "https://i.ibb.co/39J7VgTt/517.png";
            case "518": return "https://i.ibb.co/R4Gfz5bt/518.png";
            case "519": return "https://i.ibb.co/Jw5WCngY/519.png";
            case "520": return "https://i.ibb.co/yckxYSxX/520.png";
            case "521": return "https://i.ibb.co/tpzXf0S4/521.png";
            case "522": return "https://i.ibb.co/hJd6YgMq/522.png";
            case "523": return "https://i.ibb.co/tpJ1WsT0/523.png";
            case "524": return "https://i.ibb.co/x82FCqDR/524.png";
            case "525": return "https://i.ibb.co/Kjxmwhh0/525.png";
            case "526": return "https://i.ibb.co/6cwDRfgv/526.png";
            case "527": return "https://i.ibb.co/PZwWv2RX/527.png";
            case "528": return "https://i.ibb.co/pjSV39PD/528.png";
            case "529": return "https://i.ibb.co/YCKFRjY/529.png";
            case "530": return "https://i.ibb.co/39VQN8xH/530.png";
            case "531": return "https://i.ibb.co/YTq8Y8Lc/531.png";
            case "532": return "https://i.ibb.co/xq0McQ3S/532.png";
            case "533": return "https://i.ibb.co/WNqPmDsZ/533.png";
            case "534": return "https://i.ibb.co/rK2CZ7VT/534.png";
            case "535": return "https://i.ibb.co/kVQPJNGt/535.png";
            case "536": return "https://i.ibb.co/gbkqkc4C/536.png";
            case "537": return "https://i.ibb.co/RdTQxzs/537.png";
            case "538": return "https://i.ibb.co/p6bLcHQy/538.png";
            case "539": return "https://i.ibb.co/5WsYqxgR/539.png";
            case "540": return "https://i.ibb.co/PvH6d89d/540.png";
            case "541": return "https://i.ibb.co/gZ7sQ4Yk/541.png";
            case "542": return "https://i.ibb.co/1YjqXKmx/542.png";
            case "543": return "https://i.ibb.co/Q7S8BLH3/543.png";
            case "544": return "https://i.ibb.co/BVqvfnnN/544.png";
            case "545": return "https://i.ibb.co/DJjtj9f/545.png";
            case "546": return "https://i.ibb.co/tTRp06Zt/546.png";
            case "547": return "https://i.ibb.co/V0zydMRz/547.png";
            case "548": return "https://i.ibb.co/wNrQZ4Jk/548.png";
            case "549": return "https://i.ibb.co/SDRwQPV9/549.png";
            case "550": return "https://i.ibb.co/twhzvCTS/550.png";
            case "551": return "https://i.ibb.co/h1MjBYYx/551.png";
            case "552": return "https://i.ibb.co/3YPyd8MG/552.png";
            case "553": return "https://i.ibb.co/6JLNz7Sw/553.png";
            case "554": return "https://i.ibb.co/Kx7S3WNB/554.png";
            case "555": return "https://i.ibb.co/ZR9Y3dqq/555.png";
            case "556": return "https://i.ibb.co/yngrj44R/556.png";
            case "557": return "https://i.ibb.co/F4qcGJRT/557.png";
            case "558": return "https://i.ibb.co/TBhXPNH9/558.png";
            case "559": return "https://i.ibb.co/MxhqsJTj/559.png";
            case "560": return "https://i.ibb.co/PvbQ8kst/560.png";
            case "561": return "https://i.ibb.co/qY0xNbbX/561.png";
            case "562": return "https://i.ibb.co/xKFBzMw3/562.png";
            case "563": return "https://i.ibb.co/G4s7NDH8/563.png";
            case "564": return "https://i.ibb.co/Kx1gyJHz/564.png";
            case "565": return "https://i.ibb.co/spMGrKrr/565.png";
            case "566": return "https://i.ibb.co/rKBMcMNr/566.png";
            case "567": return "https://i.ibb.co/DDv7V5gH/567.png";
            case "568": return "https://i.ibb.co/xS6Vhc3V/568.png";
            case "569": return "https://i.ibb.co/YFp2qPKR/569.png";
            case "570": return "https://i.ibb.co/bgZWSgbc/570.png";
            case "571": return "https://i.ibb.co/LD3Qkz9x/571.png";
            case "572": return "https://i.ibb.co/x01q8Gm/572.png";
            case "573": return "https://i.ibb.co/5WKX6bv7/573.png";
            case "574": return "https://i.ibb.co/m53GFW1p/574.png";
            case "575": return "https://i.ibb.co/d0FL3YTp/575.png";
            case "576": return "https://i.ibb.co/21DPmMy8/576.png";
            case "577": return "https://i.ibb.co/wZkwTg7N/577.png";
            case "578": return "https://i.ibb.co/0NbpHHM/578.png";
            case "579": return "https://i.ibb.co/Zzhv0Wz3/579.png";
            case "580": return "https://i.ibb.co/0yNpLsfG/580.png";
            case "581": return "https://i.ibb.co/cSRWpsG8/581.png";
            case "582": return "https://i.ibb.co/7dhwrWxp/582.png";
            case "583": return "https://i.ibb.co/21jmg8Nq/583.png";
            case "584": return "https://i.ibb.co/JWdcZcdS/584.png";
            case "585": return "https://i.ibb.co/FkVH9MT9/585.png";
            case "586": return "https://i.ibb.co/0yN7DkTK/586.png";
            case "587": return "https://i.ibb.co/Txhc2PL3/587.png";
            case "588": return "https://i.ibb.co/PZWTnmFv/588.png";
            case "589": return "https://i.ibb.co/FbL4tfQ3/589.png";
            case "590": return "https://i.ibb.co/6JyWgqXW/590.png";
            case "591": return "https://i.ibb.co/Xx4nk4KX/591.png";
            case "592": return "https://i.ibb.co/cKZ1sB6R/592.png";
            case "593": return "https://i.ibb.co/hFWBzBvf/593.png";
            case "594": return "https://i.ibb.co/N6dRnTTL/594.png";
            case "595": return "https://i.ibb.co/JwQhqLXb/595.png";
            case "596": return "https://i.ibb.co/20721vnN/596.png";
            case "597": return "https://i.ibb.co/6cv2VZ8z/597.png";
            case "598": return "https://i.ibb.co/Kc1tq3Ry/598.png";
            case "599": return "https://i.ibb.co/wZzMD0fb/599.png";
            case "600": return "https://i.ibb.co/r2W9mN29/600.png";
            case "601": return "https://i.ibb.co/VYL43CM7/601.png";
            case "602": return "https://i.ibb.co/bMwpJ8qS/602.png";
            case "603": return "https://i.ibb.co/m5t5Hmk4/603.png";
            case "604": return "https://i.ibb.co/btx9HHC/604.png";
            default: return "https://i.ibb.co/quran-pages/" + formattedPage + ".png";
        }
    }

    private boolean downloadFile(String fileUrl, File outputFile) {
        HttpURLConnection connection = null;
        InputStream input = null;
        FileOutputStream output = null;
        
        try {
            URL url = new URL(fileUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(15000);
            connection.connect();
            
            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                return false;
            }
            
            input = connection.getInputStream();
            output = new FileOutputStream(outputFile);
            
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = input.read(buffer)) != -1) {
                output.write(buffer, 0, bytesRead);
            }
            
            return true;
        } catch (IOException e) {
            Log.e(TAG, "Error downloading file: " + fileUrl, e);
            return false;
        } finally {
            try {
                if (output != null) output.close();
                if (input != null) input.close();
            } catch (IOException ignored) {}
            
            if (connection != null) connection.disconnect();
        }
    }

    private static class DownloadResult {
        final int success;
        final int failed;
        final List<Integer> successPages;

        DownloadResult(int success, int failed, List<Integer> successPages) {
            this.success = success;
            this.failed = failed;
            this.successPages = successPages;
        }
    }
}
