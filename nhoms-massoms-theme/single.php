<?php get_header(); ?>

<div class="entry-content">
	<?php while ( have_posts() ) : the_post(); ?>
		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
			<header class="entry-header" style="margin-bottom:32px;">
				<h1 class="entry-title"><?php the_title(); ?></h1>
				<p class="entry-meta" style="color:var(--color-text-muted);font-size:.9rem;">
					<?php
					printf(
						esc_html__( 'Posted on %s by %s', 'nhoms-massoms' ),
						get_the_date(),
						get_the_author()
					);
					?>
				</p>
			</header>

			<?php if ( has_post_thumbnail() ) : ?>
				<div style="margin-bottom:32px;"><?php the_post_thumbnail( 'large' ); ?></div>
			<?php endif; ?>

			<div class="entry-body"><?php the_content(); ?></div>

			<footer class="entry-footer" style="margin-top:40px;padding-top:24px;border-top:1px solid var(--color-border);">
				<?php the_tags( '<p>Tags: ', ', ', '</p>' ); ?>
				<?php
				$cats = get_the_category_list( ', ' );
				if ( $cats ) echo '<p>Categories: ' . $cats . '</p>';
				?>
			</footer>
		</article>
	<?php endwhile; ?>
</div>

<?php get_footer(); ?>
