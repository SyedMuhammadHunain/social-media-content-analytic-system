package com.social.postwriter.repository;

import com.social.common.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {

    Optional<Post> findByIdAndDeletedFalse(String id);

    List<Post> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(String userId);
}
