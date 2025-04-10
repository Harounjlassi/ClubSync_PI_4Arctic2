import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ForumPost } from 'app/models/ForumPost.model';
import { ForumPostService } from 'app/services/forum-post.service';



@Component({
  selector: 'app-listform',
  templateUrl: './listform.component.html',
  styleUrls: ['./listform.component.scss']
})
export class ListformComponent implements OnInit {
  forumPosts: ForumPost[] = [];
  selectedPost: ForumPost | null = null;
  isEditMode = false;
  currentPostId: number | null = null;
  @ViewChild('postModal') postModal!: ElementRef;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  pages: number[] = [];
  
  postForm: FormGroup;

  constructor(
    private forumPostService: ForumPostService,
    private fb: FormBuilder
  ) {
    this.postForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadForumPosts();
  }

  loadForumPosts(): void {
    this.forumPostService.getAllForumPosts().subscribe(
      (posts: ForumPost[]) => {
        console.log(posts)        
        this.forumPosts = posts;
        this.calculatePagination();
      },
      error => {
        console.error('Error loading forum posts:', error);
      }
    );
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.forumPosts.length / this.itemsPerPage);
    this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.postForm.reset();
    this.openModal();
  }

  editPost(post: ForumPost): void {
    this.isEditMode = true;
    this.openModal()
    this.currentPostId = post.id_post;
    this.postForm.patchValue({
      content: post.content
    });
  }

  viewPost(postId: number): void {
    this.forumPostService.getForumPostById(postId).subscribe(
      (post: ForumPost) => {
        this.selectedPost = post;
        this.openModal()
      },
      error => {
        console.error('Error loading post:', error);
      }
    );
  }

  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.forumPostService.deleteForumPost(postId).subscribe(
        () => {
          this.loadForumPosts();
        },
        error => {
          console.error('Error deleting post:', error);
        }
      );
    }
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      return;
    }

    const postData: Partial<ForumPost> = {
      content: this.postForm.value.content,
      post_date: new Date(),
      author: {
        id: 1,
        firstname: 'test',
        lastname: 'test',
        dateOfBirth: '',
        email: '',
        password: '',
        accountLocked: false,
        enabled: false,
        createdDate: '',
        lastModifiedDate: '',
        role: undefined
      } // Replace with current user ID
    };

    if (this.isEditMode && this.currentPostId) {
      this.forumPostService.updateForumPost({...postData, post_date: new Date(),id_post: this.currentPostId} as ForumPost).subscribe(
        () => {
          this.loadForumPosts();
          this.closeModal()

        },
        error => {
          console.error('Error updating post:', error);
        }
      );
    } else {
      this.forumPostService.createForumPost(postData as ForumPost).subscribe(
        () => {
          this.loadForumPosts();
          this.closeModal()
        },
        error => {
          console.error('Error creating post:', error);
        }
      );
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    this.currentPage = page;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  isMaps(path: string): boolean {
    // Your existing implementation
    return false;
  }

  openModal() {
    this.postModal.nativeElement.classList.add('show');
    this.postModal.nativeElement.style.display = 'block';
    document.body.classList.add('modal-open');
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop', 'fade', 'show');
    document.body.appendChild(backdrop);
  }

  closeModal() {
    this.postModal.nativeElement.classList.remove('show');
    this.postModal.nativeElement.style.display = 'none';
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }
}