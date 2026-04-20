<?php
/**
 * Fallback template. WordPress requires this file.
 * Elementor will override this for pages that use page.php.
 */

get_header();
?>

<div class="entry-content">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : the_post(); ?>
			<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
				<h1><?php the_title(); ?></h1>
				<div class="post-content"><?php the_content(); ?></div>
			</article>
		<?php endwhile; ?>
	<?php else : ?>
		<p><?php esc_html_e( 'No content found.', 'nhoms-massoms' ); ?></p>
	<?php endif; ?>
</div>

<?php get_footer(); ?>
