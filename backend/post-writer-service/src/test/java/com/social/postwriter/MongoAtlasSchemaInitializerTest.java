package com.social.postwriter;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import org.bson.Document;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class MongoAtlasSchemaInitializerTest {

    @Test
    @DisplayName("Clean wipe existing collections and initialize indexes on MongoDB Atlas")
    void wipeAndInitializeIndexes() {
        String uri = AtlasTestHelper.resolveUri();
        if (uri == null) {
            System.out.println("MONGODB_URI not found. Skipping Atlas schema initialization.");
            return;
        }

        if (!"true".equalsIgnoreCase(System.getenv("CONFIRM_ATLAS_WIPE"))
                && !"true".equalsIgnoreCase(System.getProperty("confirmAtlasWipe"))) {
            System.out.println("CONFIRM_ATLAS_WIPE not set to 'true'. Skipping destructive wipe during standard test run.");
            return;
        }

        try (MongoClient client = MongoClients.create(uri)) {
            MongoDatabase db = client.getDatabase("SocialMediaContentAnalysisSystem");
            System.out.println("Connected to: " + db.getName() + " on MongoDB Atlas.");

            String[] collections = {"PostsDB", "FollowDB", "LikesDB", "CommentsDB", "FeedDB", "UsersDB"};

            // Step 1: Wipe all existing collections
            System.out.println("--- Dropping existing collections for clean state ---");
            for (String collName : collections) {
                db.getCollection(collName).drop();
                System.out.println("  Dropped collection: " + collName);
            }

            // Step 2: Initialize PostsDB Indexes
            MongoCollection<Document> posts = db.getCollection("PostsDB");
            posts.createIndex(Indexes.compoundIndex(Indexes.ascending("userId"), Indexes.descending("createdAt")));
            posts.createIndex(Indexes.ascending("hashtags"));
            System.out.println("Initialized PostsDB indexes (userId+createdAt, hashtags)");

            // Step 3: Initialize FollowDB Indexes
            MongoCollection<Document> follows = db.getCollection("FollowDB");
            follows.createIndex(
                    Indexes.compoundIndex(Indexes.ascending("followerId"), Indexes.ascending("followingId")),
                    new IndexOptions().unique(true).name("follower_following_unique_idx")
            );
            follows.createIndex(Indexes.ascending("followerId"));
            follows.createIndex(Indexes.ascending("followingId"));
            System.out.println("Initialized FollowDB indexes (followerId+followingId unique, followerId, followingId)");

            // Step 4: Initialize LikesDB Indexes
            MongoCollection<Document> likes = db.getCollection("LikesDB");
            likes.createIndex(
                    Indexes.compoundIndex(Indexes.ascending("userId"), Indexes.ascending("postId")),
                    new IndexOptions().unique(true).name("user_post_unique_idx")
            );
            likes.createIndex(Indexes.ascending("postId"));
            System.out.println("Initialized LikesDB indexes (userId+postId unique, postId)");

            // Step 5: Initialize CommentsDB Indexes
            MongoCollection<Document> comments = db.getCollection("CommentsDB");
            comments.createIndex(Indexes.compoundIndex(Indexes.ascending("postId"), Indexes.descending("createdAt")));
            comments.createIndex(Indexes.ascending("userId"));
            System.out.println("Initialized CommentsDB indexes (postId+createdAt, userId)");

            // Step 6: Initialize FeedDB Indexes
            MongoCollection<Document> feeds = db.getCollection("FeedDB");
            feeds.createIndex(Indexes.compoundIndex(Indexes.ascending("userId"), Indexes.descending("createdAt")));
            feeds.createIndex(
                    Indexes.compoundIndex(Indexes.ascending("userId"), Indexes.ascending("postId")),
                    new IndexOptions().unique(true).name("user_feed_post_unique_idx")
            );
            System.out.println("Initialized FeedDB indexes (userId+createdAt, userId+postId unique)");

            // Step 7: Initialize UsersDB Indexes
            MongoCollection<Document> users = db.getCollection("UsersDB");
            users.createIndex(Indexes.ascending("username"), new IndexOptions().unique(true).name("username_unique_idx"));
            users.createIndex(Indexes.ascending("email"), new IndexOptions().unique(true).name("email_unique_idx"));
            System.out.println("Initialized UsersDB indexes (username unique, email unique)");

            // Step 8: Verify all collections and indexes exist
            List<String> createdColls = new ArrayList<>();
            for (String name : db.listCollectionNames()) {
                createdColls.add(name);
            }
            System.out.println("=== Verified Collections in Database: ===");
            for (String coll : collections) {
                assertTrue(createdColls.contains(coll), "Collection " + coll + " must exist in database");
                System.out.println("  ✓ Collection: " + coll);
                for (Document idx : db.getCollection(coll).listIndexes()) {
                    System.out.println("      - Index: " + idx.getString("name") + " -> " + idx.get("key"));
                }
            }

            System.out.println("=== Schema Wipe and Index Initialization Complete ===");
        }
    }
}
