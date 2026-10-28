package com.social.feedreader.service;

import com.social.common.dto.FeedResponse;
import com.social.common.model.FeedItem;
import com.social.common.model.Post;
import com.social.common.model.User;
import com.social.feedreader.repository.FeedItemReaderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FeedReaderService {

    private final FeedItemReaderRepository feedItemRepository;
    private final MongoTemplate mongoTemplate;

    public FeedReaderService(FeedItemReaderRepository feedItemRepository, MongoTemplate mongoTemplate) {
        this.feedItemRepository = feedItemRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public FeedResponse getFeedForUser(String userId, int page, int size) {
        Page<FeedItem> feedPage = feedItemRepository.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size));

        List<FeedItem> items = feedPage.getContent();
        Set<String> postIds = items.stream()
                .map(FeedItem::getPostId)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        // Also query latest platform posts so newly created posts are discoverable across users
        List<Post> recentPlatformPosts = mongoTemplate.find(
                new Query(Criteria.where("deleted").is(false))
                        .with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
                        .limit(size),
                Post.class
        );
        for (Post rp : recentPlatformPosts) {
            postIds.add(rp.getId());
        }

        if (postIds.isEmpty()) {
            return FeedResponse.builder()
                    .userId(userId)
                    .page(page)
                    .size(size)
                    .posts(Collections.emptyList())
                    .build();
        }

        Query query = new Query(Criteria.where("id").in(postIds).and("deleted").is(false));
        List<Post> posts = mongoTemplate.find(query, Post.class);
        posts.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        // Batch lookup author profiles from UsersDB to display real names and avatars
        List<String> authorIds = posts.stream().map(Post::getUserId).filter(Objects::nonNull).distinct().toList();
        List<User> authors = mongoTemplate.find(new Query(Criteria.where("id").in(authorIds)), User.class);
        Map<String, User> userMap = authors.stream()
                .collect(Collectors.toMap(User::getId, Function.identity(), (a, b) -> a));

        List<FeedResponse.FeedPostDto> feedPosts = posts.stream()
                .map(p -> toFeedPostDto(p, userMap))
                .toList();

        return FeedResponse.builder()
                .userId(userId)
                .page(page)
                .size(size)
                .posts(feedPosts)
                .build();
    }

    private FeedResponse.FeedPostDto toFeedPostDto(Post post, Map<String, User> userMap) {
        User author = userMap != null ? userMap.get(post.getUserId()) : null;
        String authorName = (author != null && author.getFullName() != null && !author.getFullName().isBlank())
                ? author.getFullName()
                : (author != null ? author.getUsername() : post.getUserId());

        String authorAvatar = (author != null && author.getAvatarUrl() != null && !author.getAvatarUrl().isBlank())
                ? author.getAvatarUrl()
                : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + post.getUserId();

        return FeedResponse.FeedPostDto.builder()
                .postId(post.getId())
                .authorId(post.getUserId())
                .authorName(authorName)
                .authorAvatar(authorAvatar)
                .text(post.getText())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .hashtags(post.getHashtags())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByCurrentUser(false)
                .createdAt(post.getCreatedAt())
                .build();
    }
}
