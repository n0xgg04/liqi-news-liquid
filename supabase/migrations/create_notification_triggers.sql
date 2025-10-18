-- Create notification events table
CREATE TABLE IF NOT EXISTS public.notification_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(post_id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  actor_avatar TEXT,
  action TEXT NOT NULL CHECK (action IN ('like', 'comment')),
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_events_target_user ON public.notification_events(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notification_events_processed ON public.notification_events(processed) WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_notification_events_post_action ON public.notification_events(post_id, action, target_user_id);

-- Enable RLS
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification events" ON public.notification_events
  FOR SELECT USING (auth.uid() = target_user_id);

-- Create function to process notification events
CREATE OR REPLACE FUNCTION process_notification_events()
RETURNS void AS $$
DECLARE
  event_record RECORD;
  aggregated_data JSONB;
  message_title TEXT;
  message_body TEXT;
  post_title TEXT;
BEGIN
  -- Process unprocessed events older than 2 minutes
  FOR event_record IN 
    SELECT 
      post_id,
      action,
      target_user_id,
      array_agg(
        jsonb_build_object(
          'id', actor_id,
          'name', actor_name,
          'avatar', actor_avatar
        )
      ) as actors,
      count(*) as count,
      max(created_at) as latest_created_at
    FROM public.notification_events
    WHERE processed = FALSE 
      AND created_at < NOW() - INTERVAL '2 minutes'
    GROUP BY post_id, action, target_user_id
  LOOP
    -- Get post title
    SELECT title INTO post_title
    FROM public.posts
    WHERE post_id = event_record.post_id;
    
    -- Create notification message
    IF event_record.count = 1 THEN
      message_title := (event_record.actors->0->>'name') || 
        CASE event_record.action 
          WHEN 'like' THEN ' thích bài viết của bạn'
          WHEN 'comment' THEN ' bình luận bài viết của bạn'
        END;
    ELSIF event_record.count = 2 THEN
      message_title := (event_record.actors->0->>'name') || ' và 1 người khác ' ||
        CASE event_record.action 
          WHEN 'like' THEN 'thích bài viết của bạn'
          WHEN 'comment' THEN 'bình luận bài viết của bạn'
        END;
    ELSE
      message_title := (event_record.actors->0->>'name') || ' và ' || (event_record.count - 1) || ' người khác ' ||
        CASE event_record.action 
          WHEN 'like' THEN 'thích bài viết của bạn'
          WHEN 'comment' THEN 'bình luận bài viết của bạn'
        END;
    END IF;
    
    message_body := '"' || post_title || '"';
    
    -- Insert notification
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      data,
      is_read
    ) VALUES (
      event_record.target_user_id,
      event_record.action,
      message_title,
      message_body,
      jsonb_build_object(
        'post_id', event_record.post_id,
        'post_title', post_title,
        'actors', event_record.actors,
        'action', event_record.action
      ),
      FALSE
    );
    
    -- Mark events as processed
    UPDATE public.notification_events
    SET processed = TRUE
    WHERE post_id = event_record.post_id 
      AND action = event_record.action 
      AND target_user_id = event_record.target_user_id
      AND processed = FALSE;
      
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to schedule processing
CREATE OR REPLACE FUNCTION schedule_notification_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the processing function asynchronously
  PERFORM pg_notify('notification_events', 'new_event');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER notification_events_trigger
  AFTER INSERT ON public.notification_events
  FOR EACH ROW
  EXECUTE FUNCTION schedule_notification_processing();
