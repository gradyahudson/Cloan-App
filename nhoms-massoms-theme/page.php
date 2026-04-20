<?php
/**
 * Default page template.
 * When Elementor is active on a page, it takes over the_content()
 * and renders the full Elementor layout inside this minimal wrapper.
 */

get_header();
?>

<?php while ( have_posts() ) : the_post(); ?>
	<article id="page-<?php the_ID(); ?>" <?php post_class( 'page-content' ); ?>>
		<?php the_content(); ?>
	</article>
<?php endwhile; ?>

<?php get_footer(); ?>
