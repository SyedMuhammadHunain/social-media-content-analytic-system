package com.social.feedreader.service;

import com.social.common.dto.FeedResponse;
import com.social.common.model.FeedItem;
import com.social.common.model.Post;
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
        if (items.isEmpty()) {
            return FeedResponse.builder()
                    .userId(userId)
                    .page(page)
                    .size(size)
                    .posts(Collections.emptyList())
                    .build();
        }

        List<String> postIds = items.stream().map(FeedItem::getPostId).distinct().toList();

        Query query = new Query(Criteria.where("id").in(postIds).and("deleted").is(false));
        List<Post> posts = mongoTemplate.find(query, Post.class);
        Map<String, Post> postMap = posts.stream()
                .collect(Collectors.toMap(Post::getId, Function.identity(), (a, b) -> a));

        List<FeedResponse.FeedPostDto> feedPosts = new ArrayList<>();
        for (FeedItem item : items) {
            Post post = postMap.get(item.getPostId());
            if (post != null) {
                feedPosts.add(FeedResponse.FeedPostDto.builder()
                        .postId(post.getId())
                        .authorId(post.getUserId())
                        .authorName(post.getUserId())
                        .authorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + post.getUserId())
                        .text(post.getText())
                        .mediaUrl(post.getMediaUrl())
                        .mediaType(post.getMediaType())
                        .hashtags(post.getHashtags())
                        .likeCount(post.getLikeCount())
                        .commentCount(post.getCommentCount())
                        .likedByCurrentUser(false)
                        .createdAt(post.getCreatedAt())
                        .build());
            }
        }

        return FeedResponse.builder()
                .userId(userId)
                .page(page)
                .size(size)
                .posts(feedPosts)
                .build();
    }
}
