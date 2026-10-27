package com.social.postwriter;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class MongoAtlasDatabaseSeederTest {

    @Test
    @DisplayName("Populate MongoDB Atlas SocialMediaContentAnalysisSystem with comprehensive seed data")
    void seedAtlasDatabase() {
        String uri = AtlasTestHelper.resolveUri();
        if (uri == null) {
            System.out.println("MONGODB_URI not found. Skipping seeding.");
            return;
        }

        try (MongoClient client = MongoClients.create(uri)) {
            MongoDatabase db = client.getDatabase("SocialMediaContentAnalysisSystem");
            System.out.println("Connected to: " + db.getName() + " on Atlas for seeding.");

            MongoCollection<Document> usersColl = db.getCollection("UsersDB");
            MongoCollection<Document> postsColl = db.getCollection("PostsDB");
            MongoCollection<Document> followsColl = db.getCollection("FollowDB");
            MongoCollection<Document> likesColl = db.getCollection("LikesDB");
            MongoCollection<Document> commentsColl = db.getCollection("CommentsDB");
            MongoCollection<Document> feedColl = db.getCollection("FeedDB");

            // Idempotency check: if data already exists, verify or refresh on FORCE_RESEED
            if (usersColl.countDocuments() > 0) {
                if ("true".equalsIgnoreCase(System.getenv("FORCE_RESEED"))
                        || "true".equalsIgnoreCase(System.getProperty("forceReseed"))) {
                    System.out.println("FORCE_RESEED=true. Clearing previous seed documents for fresh seed...");
                    usersColl.deleteMany(new Document());
                    followsColl.deleteMany(new Document());
                    postsColl.deleteMany(new Document());
                    likesColl.deleteMany(new Document());
                    commentsColl.deleteMany(new Document());
                    feedColl.deleteMany(new Document());
                } else {
                    System.out.println("Atlas database already contains seed data. Verifying document counts...");
                    assertEquals(4, usersColl.countDocuments());
                    assertEquals(8, followsColl.countDocuments());
                    assertTrue(postsColl.countDocuments() >= 12, "Should have at least 12 initial seed posts");
                    assertTrue(likesColl.countDocuments() >= 26, "Should have at least 26 initial seed likes");
                    assertTrue(commentsColl.countDocuments() >= 13, "Should have at least 13 initial seed comments");
                    assertTrue(feedColl.countDocuments() >= 24, "Should have at least 24 initial feed entries");
                    System.out.println("Idempotent check PASSED: database verified healthy.");
                    return;
                }
            }

            Instant now = Instant.now();

            // 1. Seed Users (4 Users)
            List<Document> userDocs = List.of(
                    new Document("_id", "user_hunain")
                            .append("username", "hunain")
                            .append("email", "hunain@example.com")
                            .append("passwordHash", "$2a$10$w8T0hR.oIlnu0g3r9D57KOD.fWpLz98D65M9zKx1vO8B0Wp4rL9qy")
                            .append("fullName", "Syed Muhammad Hunain")
                            .append("authProvider", "LOCAL")
                            .append("avatarUrl", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                            .append("createdAt", Date.from(now.minus(30, ChronoUnit.DAYS))),
                    new Document("_id", "user_alice")
                            .append("username", "alice_tech")
                            .append("email", "alice@example.com")
                            .append("passwordHash", "$2a$10$w8T0hR.oIlnu0g3r9D57KOD.fWpLz98D65M9zKx1vO8B0Wp4rL9qy")
                            .append("fullName", "Alice Vance")
                            .append("authProvider", "LOCAL")
                            .append("avatarUrl", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                            .append("createdAt", Date.from(now.minus(28, ChronoUnit.DAYS))),
                    new Document("_id", "user_bob")
                            .append("username", "bob_creator")
                            .append("email", "bob@example.com")
                            .append("passwordHash", "$2a$10$w8T0hR.oIlnu0g3r9D57KOD.fWpLz98D65M9zKx1vO8B0Wp4rL9qy")
                            .append("fullName", "Bob Miller")
                            .append("authProvider", "LOCAL")
                            .append("avatarUrl", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                            .append("createdAt", Date.from(now.minus(25, ChronoUnit.DAYS))),
                    new Document("_id", "user_charlie")
                            .append("username", "charlie_dev")
                            .append("email", "charlie@example.com")
                            .append("passwordHash", "$2a$10$w8T0hR.oIlnu0g3r9D57KOD.fWpLz98D65M9zKx1vO8B0Wp4rL9qy")
                            .append("fullName", "Charlie Gomez")
                            .append("authProvider", "LOCAL")
                            .append("avatarUrl", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150")
                            .append("createdAt", Date.from(now.minus(20, ChronoUnit.DAYS)))
            );
            usersColl.insertMany(userDocs);
            System.out.println("Seeded " + userDocs.size() + " users into UsersDB.");

            // 2. Seed Follow Relationships (Follow Graph)
            // Alice follows Hunain, Bob
            // Bob follows Hunain, Charlie
            // Charlie follows Hunain, Alice
            // Hunain follows Alice, Bob
            List<Document> followDocs = List.of(
                    new Document("_id", "follow_01").append("followerId", "user_alice").append("followingId", "user_hunain").append("followedAt", Date.from(now.minus(15, ChronoUnit.DAYS))),
                    new Document("_id", "follow_02").append("followerId", "user_alice").append("followingId", "user_bob").append("followedAt", Date.from(now.minus(14, ChronoUnit.DAYS))),
                    new Document("_id", "follow_03").append("followerId", "user_bob").append("followingId", "user_hunain").append("followedAt", Date.from(now.minus(12, ChronoUnit.DAYS))),
                    new Document("_id", "follow_04").append("followerId", "user_bob").append("followingId", "user_charlie").append("followedAt", Date.from(now.minus(11, ChronoUnit.DAYS))),
                    new Document("_id", "follow_05").append("followerId", "user_charlie").append("followingId", "user_hunain").append("followedAt", Date.from(now.minus(10, ChronoUnit.DAYS))),
                    new Document("_id", "follow_06").append("followerId", "user_charlie").append("followingId", "user_alice").append("followedAt", Date.from(now.minus(9, ChronoUnit.DAYS))),
                    new Document("_id", "follow_07").append("followerId", "user_hunain").append("followingId", "user_alice").append("followedAt", Date.from(now.minus(8, ChronoUnit.DAYS))),
                    new Document("_id", "follow_08").append("followerId", "user_hunain").append("followingId", "user_bob").append("followedAt", Date.from(now.minus(7, ChronoUnit.DAYS)))
            );
            followsColl.insertMany(followDocs);
            System.out.println("Seeded " + followDocs.size() + " follow relationships into FollowDB.");

            // Map followers for feed fan-out
            Map<String, List<String>> followersMap = new HashMap<>();
            for (Document f : followDocs) {
                String follower = f.getString("followerId");
                String following = f.getString("followingId");
                followersMap.computeIfAbsent(following, k -> new ArrayList<>()).add(follower);
            }

            // 3. Seed Posts (12 Posts spanning TEXT, IMAGE, VIDEO)
            List<Document> postDocs = List.of(
                    new Document("_id", "post_001")
                            .append("userId", "user_hunain")
                            .append("text", "Just deployed our distributed microservices architecture on MongoDB Atlas & Azure Blob Storage! 🚀 #cloud #architecture #java21")
                            .append("mediaType", "IMAGE")
                            .append("mediaUrl", "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200")
                            .append("hashtags", List.of("cloud", "architecture", "java21"))
                            .append("likeCount", 3L)
                            .append("commentCount", 2L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(5, ChronoUnit.HOURS))),

                    new Document("_id", "post_002")
                            .append("userId", "user_alice")
                            .append("text", "Exploring React 19 concurrent features with Meta Astryx design system tokens. UI feels incredibly snappy! ⚡ #react #frontend #astryx")
                            .append("mediaType", "TEXT")
                            .append("mediaUrl", null)
                            .append("hashtags", List.of("react", "frontend", "astryx"))
                            .append("likeCount", 2L)
                            .append("commentCount", 1L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(8, ChronoUnit.HOURS))),

                    new Document("_id", "post_003")
                            .append("userId", "user_bob")
                            .append("text", "4K Video walkthrough of our event-driven fan-out architecture for real-time newsfeed generation. Check out the demo below! 🎥 #systemdesign #devops")
                            .append("mediaType", "VIDEO")
                            .append("mediaUrl", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
                            .append("hashtags", List.of("systemdesign", "devops"))
                            .append("likeCount", 2L)
                            .append("commentCount", 1L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(12, ChronoUnit.HOURS))),

                    new Document("_id", "post_004")
                            .append("userId", "user_charlie")
                            .append("text", "Benchmarked MongoDB Atlas write throughput with compound indexing. Sub-2s SLA maintained across all fan-out writes! 📊 #database #mongodb #benchmarks")
                            .append("mediaType", "IMAGE")
                            .append("mediaUrl", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200")
                            .append("hashtags", List.of("database", "mongodb", "benchmarks"))
                            .append("likeCount", 3L)
                            .append("commentCount", 2L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(1, ChronoUnit.DAYS))),

                    new Document("_id", "post_005")
                            .append("userId", "user_hunain")
                            .append("text", "Writing clean, testable Spring Boot microservices with Spring Cloud Gateway reverse routing. Love the clean separation of concerns! ☕ #springboot #java #microservices")
                            .append("mediaType", "TEXT")
                            .append("mediaUrl", null)
                            .append("hashtags", List.of("springboot", "java", "microservices"))
                            .append("likeCount", 2L)
                            .append("commentCount", 1L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(2, ChronoUnit.DAYS))),

                    new Document("_id", "post_006")
                            .append("userId", "user_alice")
                            .append("text", "Building accessible, high-contrast dashboards using WCAG AA design standards. Every user deserves great UX! 🎨 #a11y #design #webdev")
                            .append("mediaType", "IMAGE")
                            .append("mediaUrl", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200")
                            .append("hashtags", List.of("a11y", "design", "webdev"))
                            .append("likeCount", 1L)
                            .append("commentCount", 1L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(3, ChronoUnit.DAYS))),

                    new Document("_id", "post_007")
                            .append("userId", "user_bob")
                            .append("text", "Setting up CI/CD pipeline automated regression tests with Chrome DevTools Protocol. Zero regressions escape to main! 🛡️ #testing #ci #quality")
                            .append("mediaType", "TEXT")
                            .append("mediaUrl", null)
                            .append("hashtags", List.of("testing", "ci", "quality"))
                            .append("likeCount", 2L)
                            .append("commentCount", 0L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(3, ChronoUnit.DAYS).minus(4, ChronoUnit.HOURS))),

                    new Document("_id", "post_008")
                            .append("userId", "user_charlie")
                            .append("text", "Securing API gateways with JWT token verification and OWASP Top 10 header policies. Security is non-negotiable! 🔒 #security #owasp #cybersecurity")
                            .append("mediaType", "IMAGE")
                            .append("mediaUrl", "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200")
                            .append("hashtags", List.of("security", "owasp", "cybersecurity"))
                            .append("likeCount", 3L)
                            .append("commentCount", 1L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(4, ChronoUnit.DAYS))),

                    new Document("_id", "post_009")
                            .append("userId", "user_hunain")
                            .append("text", "Demo video showing pre-signed SAS upload directly to Azure Blob Storage bypassing application servers. Ultra efficient! ☁️ #azure #blobstorage #cloud")
                            .append("mediaType", "VIDEO")
                            .append("mediaUrl", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4")
                            .append("hashtags", List.of("azure", "blobstorage", "cloud"))
                            .append("likeCount", 2L)
                            .append("commentCount", 1L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(5, ChronoUnit.DAYS))),

                    new Document("_id", "post_010")
                            .append("userId", "user_alice")
                            .append("text", "Deep dive into TypeScript 5.8 const type parameters and satisfies operator. Strongly typed contracts make refactoring painless! 💻 #typescript #cleancode")
                            .append("mediaType", "TEXT")
                            .append("mediaUrl", null)
                            .append("hashtags", List.of("typescript", "cleancode"))
                            .append("likeCount", 2L)
                            .append("commentCount", 1L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(6, ChronoUnit.DAYS))),

                    new Document("_id", "post_011")
                            .append("userId", "user_bob")
                            .append("text", "Creator analytical dashboard live telemetry: real-time engagement graph showing impressions vs interactions. 📈 #analytics #creators #insights")
                            .append("mediaType", "IMAGE")
                            .append("mediaUrl", "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200")
                            .append("hashtags", List.of("analytics", "creators", "insights"))
                            .append("likeCount", 1L)
                            .append("commentCount", 0L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(7, ChronoUnit.DAYS))),

                    new Document("_id", "post_012")
                            .append("userId", "user_charlie")
                            .append("text", "Wrapping up our Social Media Content Analysis System backend verification with 100% test coverage across all 8 microservices! 🎓 #graduation #computerengineering #academics")
                            .append("mediaType", "TEXT")
                            .append("mediaUrl", null)
                            .append("hashtags", List.of("graduation", "computerengineering", "academics"))
                            .append("likeCount", 3L)
                            .append("commentCount", 2L)
                            .append("deleted", false)
                            .append("createdAt", Date.from(now.minus(8, ChronoUnit.DAYS)))
            );
            postsColl.insertMany(postDocs);
            System.out.println("Seeded " + postDocs.size() + " posts into PostsDB.");

            // 4. Seed Likes (LikesDB) matching the likeCounts
            List<Document> likeDocs = List.of(
                    // post_001 (likes: 3)
                    new Document("_id", "like_01").append("userId", "user_alice").append("postId", "post_001").append("likedAt", Date.from(now.minus(4, ChronoUnit.HOURS))),
                    new Document("_id", "like_02").append("userId", "user_bob").append("postId", "post_001").append("likedAt", Date.from(now.minus(3, ChronoUnit.HOURS))),
                    new Document("_id", "like_03").append("userId", "user_charlie").append("postId", "post_001").append("likedAt", Date.from(now.minus(2, ChronoUnit.HOURS))),
                    // post_002 (likes: 2)
                    new Document("_id", "like_04").append("userId", "user_hunain").append("postId", "post_002").append("likedAt", Date.from(now.minus(7, ChronoUnit.HOURS))),
                    new Document("_id", "like_05").append("userId", "user_charlie").append("postId", "post_002").append("likedAt", Date.from(now.minus(6, ChronoUnit.HOURS))),
                    // post_003 (likes: 2)
                    new Document("_id", "like_06").append("userId", "user_hunain").append("postId", "post_003").append("likedAt", Date.from(now.minus(11, ChronoUnit.HOURS))),
                    new Document("_id", "like_07").append("userId", "user_alice").append("postId", "post_003").append("likedAt", Date.from(now.minus(10, ChronoUnit.HOURS))),
                    // post_004 (likes: 3)
                    new Document("_id", "like_08").append("userId", "user_hunain").append("postId", "post_004").append("likedAt", Date.from(now.minus(22, ChronoUnit.HOURS))),
                    new Document("_id", "like_09").append("userId", "user_alice").append("postId", "post_004").append("likedAt", Date.from(now.minus(21, ChronoUnit.HOURS))),
                    new Document("_id", "like_10").append("userId", "user_bob").append("postId", "post_004").append("likedAt", Date.from(now.minus(20, ChronoUnit.HOURS))),
                    // post_005 (likes: 2)
                    new Document("_id", "like_11").append("userId", "user_alice").append("postId", "post_005").append("likedAt", Date.from(now.minus(40, ChronoUnit.HOURS))),
                    new Document("_id", "like_12").append("userId", "user_bob").append("postId", "post_005").append("likedAt", Date.from(now.minus(39, ChronoUnit.HOURS))),
                    // post_006 (likes: 1)
                    new Document("_id", "like_13").append("userId", "user_charlie").append("postId", "post_006").append("likedAt", Date.from(now.minus(60, ChronoUnit.HOURS))),
                    // post_007 (likes: 2)
                    new Document("_id", "like_14").append("userId", "user_hunain").append("postId", "post_007").append("likedAt", Date.from(now.minus(70, ChronoUnit.HOURS))),
                    new Document("_id", "like_15").append("userId", "user_charlie").append("postId", "post_007").append("likedAt", Date.from(now.minus(69, ChronoUnit.HOURS))),
                    // post_008 (likes: 3)
                    new Document("_id", "like_16").append("userId", "user_hunain").append("postId", "post_008").append("likedAt", Date.from(now.minus(90, ChronoUnit.HOURS))),
                    new Document("_id", "like_17").append("userId", "user_alice").append("postId", "post_008").append("likedAt", Date.from(now.minus(89, ChronoUnit.HOURS))),
                    new Document("_id", "like_18").append("userId", "user_bob").append("postId", "post_008").append("likedAt", Date.from(now.minus(88, ChronoUnit.HOURS))),
                    // post_009 (likes: 2)
                    new Document("_id", "like_19").append("userId", "user_alice").append("postId", "post_009").append("likedAt", Date.from(now.minus(110, ChronoUnit.HOURS))),
                    new Document("_id", "like_20").append("userId", "user_bob").append("postId", "post_009").append("likedAt", Date.from(now.minus(109, ChronoUnit.HOURS))),
                    // post_010 (likes: 2)
                    new Document("_id", "like_21").append("userId", "user_hunain").append("postId", "post_010").append("likedAt", Date.from(now.minus(130, ChronoUnit.HOURS))),
                    new Document("_id", "like_22").append("userId", "user_charlie").append("postId", "post_010").append("likedAt", Date.from(now.minus(129, ChronoUnit.HOURS))),
                    // post_011 (likes: 1)
                    new Document("_id", "like_23").append("userId", "user_hunain").append("postId", "post_011").append("likedAt", Date.from(now.minus(150, ChronoUnit.HOURS))),
                    // post_012 (likes: 3)
                    new Document("_id", "like_24").append("userId", "user_hunain").append("postId", "post_012").append("likedAt", Date.from(now.minus(170, ChronoUnit.HOURS))),
                    new Document("_id", "like_25").append("userId", "user_alice").append("postId", "post_012").append("likedAt", Date.from(now.minus(169, ChronoUnit.HOURS))),
                    new Document("_id", "like_26").append("userId", "user_bob").append("postId", "post_012").append("likedAt", Date.from(now.minus(168, ChronoUnit.HOURS)))
            );
            likesColl.insertMany(likeDocs);
            System.out.println("Seeded " + likeDocs.size() + " likes into LikesDB.");

            // 5. Seed Comments (CommentsDB) matching the commentCounts
            List<Document> commentDocs = List.of(
                    new Document("_id", "comment_01").append("postId", "post_001").append("userId", "user_alice").append("content", "Impressive architecture! Did you configure replica sets on Atlas?").append("parentCommentId", null).append("createdAt", Date.from(now.minus(4, ChronoUnit.HOURS))),
                    new Document("_id", "comment_02").append("postId", "post_001").append("userId", "user_hunain").append("content", "Yes, 3-node replica set in AWS ap-south-1 with automatic failover!").append("parentCommentId", "comment_01").append("createdAt", Date.from(now.minus(3, ChronoUnit.HOURS))),
                    new Document("_id", "comment_03").append("postId", "post_002").append("userId", "user_bob").append("content", "Astryx design tokens make theme customization super clean!").append("parentCommentId", null).append("createdAt", Date.from(now.minus(7, ChronoUnit.HOURS))),
                    new Document("_id", "comment_04").append("postId", "post_003").append("userId", "user_charlie").append("content", "Fan-out on write guarantees O(1) feed reads. Great design choice.").append("parentCommentId", null).append("createdAt", Date.from(now.minus(11, ChronoUnit.HOURS))),
                    new Document("_id", "comment_05").append("postId", "post_004").append("userId", "user_hunain").append("content", "Those compound indexes really keep query latency under 10ms.").append("parentCommentId", null).append("createdAt", Date.from(now.minus(20, ChronoUnit.HOURS))),
                    new Document("_id", "comment_06").append("postId", "post_004").append("userId", "user_alice").append("content", "Love seeing real empirical latency numbers!").append("parentCommentId", null).append("createdAt", Date.from(now.minus(19, ChronoUnit.HOURS))),
                    new Document("_id", "comment_07").append("postId", "post_005").append("userId", "user_bob").append("content", "Spring Cloud Gateway makes reverse proxying seamless.").append("parentCommentId", null).append("createdAt", Date.from(now.minus(38, ChronoUnit.HOURS))),
                    new Document("_id", "comment_08").append("postId", "post_006").append("userId", "user_charlie").append("content", "Accessibility is too often overlooked. Kudos for adhering to WCAG AA!").append("parentCommentId", null).append("createdAt", Date.from(now.minus(58, ChronoUnit.HOURS))),
                    new Document("_id", "comment_09").append("postId", "post_008").append("userId", "user_hunain").append("content", "Defense in depth at the gateway level is essential.").append("parentCommentId", null).append("createdAt", Date.from(now.minus(85, ChronoUnit.HOURS))),
                    new Document("_id", "comment_10").append("postId", "post_009").append("userId", "user_bob").append("content", "SAS URLs prevent our backend from becoming a media bottleneck.").append("parentCommentId", null).append("createdAt", Date.from(now.minus(105, ChronoUnit.HOURS))),
                    new Document("_id", "comment_11").append("postId", "post_010").append("userId", "user_charlie").append("content", "TypeScript 5.8 satisfies keyword catches so many schema mismatches.").append("parentCommentId", null).append("createdAt", Date.from(now.minus(125, ChronoUnit.HOURS))),
                    new Document("_id", "comment_12").append("postId", "post_012").append("userId", "user_hunain").append("content", "Congratulations team! 100% test pass rate across all 8 services!").append("parentCommentId", null).append("createdAt", Date.from(now.minus(165, ChronoUnit.HOURS))),
                    new Document("_id", "comment_13").append("postId", "post_012").append("userId", "user_alice").append("content", "Huge milestone achieved! Ready for full deployment.").append("parentCommentId", "comment_12").append("createdAt", Date.from(now.minus(164, ChronoUnit.HOURS)))
            );
            commentsColl.insertMany(commentDocs);
            System.out.println("Seeded " + commentDocs.size() + " comments into CommentsDB.");

            // 6. Fan-out Feed Items into FeedDB
            // Fan-out algorithm: For each post by author X, write to X's feed (self) AND to each follower Y in followersMap(X)
            List<Document> feedDocs = new ArrayList<>();
            int feedSeq = 1;
            Set<String> uniqueUserPostFeed = new HashSet<>();

            for (Document p : postDocs) {
                String postId = p.getString("_id");
                String authorId = p.getString("userId");
                Date createdAt = p.getDate("createdAt");

                // Self feed entry
                String selfKey = authorId + ":" + postId;
                if (uniqueUserPostFeed.add(selfKey)) {
                    feedDocs.add(new Document("_id", "feed_" + String.format("%04d", feedSeq++))
                            .append("userId", authorId)
                            .append("postId", postId)
                            .append("authorId", authorId)
                            .append("createdAt", createdAt));
                }

                // Follower feed entries
                List<String> followers = followersMap.getOrDefault(authorId, Collections.emptyList());
                for (String followerId : followers) {
                    String followerKey = followerId + ":" + postId;
                    if (uniqueUserPostFeed.add(followerKey)) {
                        feedDocs.add(new Document("_id", "feed_" + String.format("%04d", feedSeq++))
                                .append("userId", followerId)
                                .append("postId", postId)
                                .append("authorId", authorId)
                                .append("createdAt", createdAt));
                    }
                }
            }

            feedColl.insertMany(feedDocs);
            System.out.println("Seeded " + feedDocs.size() + " fan-out items into FeedDB.");

            // 7. Verify counts in Atlas
            assertEquals(4, usersColl.countDocuments());
            assertEquals(8, followsColl.countDocuments());
            assertEquals(12, postsColl.countDocuments());
            assertEquals(26, likesColl.countDocuments());
            assertEquals(13, commentsColl.countDocuments());
            assertTrue(feedColl.countDocuments() >= 24, "Feed items should be at least 24 fan-out records");

            System.out.println("=== Verified Database Collection Counts ===");
            System.out.println("  UsersDB:    " + usersColl.countDocuments() + " documents");
            System.out.println("  FollowDB:   " + followsColl.countDocuments() + " documents");
            System.out.println("  PostsDB:    " + postsColl.countDocuments() + " documents");
            System.out.println("  LikesDB:    " + likesColl.countDocuments() + " documents");
            System.out.println("  CommentsDB: " + commentsColl.countDocuments() + " documents");
            System.out.println("  FeedDB:     " + feedColl.countDocuments() + " documents");
            System.out.println("=== Database Seeding Completed Successfully ===");
        }
    }
}
