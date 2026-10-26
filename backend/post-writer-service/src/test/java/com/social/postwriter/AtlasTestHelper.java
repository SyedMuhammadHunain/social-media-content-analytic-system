package com.social.postwriter;

import java.io.File;
import java.io.FileInputStream;
import java.util.List;
import java.util.Properties;

final class AtlasTestHelper {

    private AtlasTestHelper() {}

    static String resolveUri() {
        String uri = System.getenv("MONGODB_URI");
        if (uri != null && !uri.isBlank()) {
            return clean(uri);
        }

        List<String> candidatePaths = List.of("../.env", ".env", "backend/.env", "../backend/.env");
        for (String path : candidatePaths) {
            File file = new File(path);
            if (file.exists()) {
                try (FileInputStream fis = new FileInputStream(file)) {
                    Properties props = new Properties();
                    props.load(fis);
                    String val = props.getProperty("MONGODB_URI");
                    if (val != null && !val.isBlank()) {
                        return clean(val);
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }

    private static String clean(String uri) {
        return uri.replace("\"", "").replace("'", "").trim();
    }
}
