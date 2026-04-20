<?php get_header(); ?>

<div class="entry-content">
	<header class="archive-header" style="margin-bottom:40px;">
		<?php the_archive_title( '<h1>', '</h1>' ); ?>
		<?php the_archive_description( '<p style="color:var(--color-text-muted);margin-top:8px;">', '</p>' ); ?>
	</header>

	<?php if ( have_posts() ) : ?>
		<div class="posts-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:32px;">
			<?php while ( have_posts() ) : the_post(); ?>
				<article id="post-<?php the_ID(); ?>" <?php post_class( 'post-card' ); ?> style="border:1px solid var(--color-border);border-radius:var(--radius);overflow:hidden;">
					<?php if ( has_post_thumbnail() ) : ?>
						<a href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'medium' ); ?></a>
					<?php endif; ?>
					<div style="padding:24px;">
						<h2 style="font-size:1.1rem;margin-bottom:8px;">
							<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
						</h2>
						<p style="font-size:.85rem;color:var(--color-text-muted);margin-bottom:12px;"><?php echo get_the_date(); ?></p>
						<p><?php the_excerpt(); ?></p>
						<a href="<?php the_permalink(); ?>" class="btn" style="margin-top:16px;font-size:.85rem;padding:8px 16px;">
							<?php esc_html_e( 'Read more', 'nhoms-massoms' ); ?>
						</a>
					</div>
				</article>
			<?php endwhile; ?>
		</div>

		<div style="margin-top:40px;text-align:center;">
			<?php the_posts_pagination(); ?>
		</div>

	<?php else : ?>
		<p><?php esc_html_e( 'No posts found.', 'nhoms-massoms' ); ?></p>
	<?php endif; ?>
</div>

<?php get_footer(); ?>
